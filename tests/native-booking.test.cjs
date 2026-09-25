const assert=require('node:assert/strict'), Module=require('node:module'),path=require('node:path');
const config=require('../lib/close-fields.json'),records=new Map();let posts=0,fail='',available=true,existing=null,current='app';const old=Module._load;
Module._load=function(name,...args){
 if(name==='server-only')return {};
 if(name==='./receipt-store')return {digest:x=>x,readRecord:async k=>k.startsWith('lead-bookings/')?existing:records.get(k),writeRecord:async(k,v)=>{records.set(k,{value:v,etag:'v'});return{etag:'v'}},withLock:async(k,f)=>f()};
 if(name==='./close')return{closeApi:async()=>({organization_id:config.organizationId,['custom.'+config.fields.applicationId]:current})};
 if(name==='./calendly')return{resolveEventType:async()=> 'https://api.calendly.com/event_types/test',providerPath:()=>'/valid',calendlyApi:async(p,m,b)=>{
  if(p==='/invitees'){posts++;if(fail)throw Error(fail);assert.equal(b.tracking.utm_content,'se_app');assert.deepEqual(Object.keys(b.tracking).sort(),['salesforce_uuid','utm_campaign','utm_content','utm_medium','utm_source','utm_term']);assert.equal(b.invitee.email,'qa@example.com');assert.equal(b.questions_and_answers[0].answer,'Yes');return{resource:{uri:'https://calendly.com/scheduled_events/test/invitees/test'}};}
  if(p.startsWith('/event_type_available_times'))return{collection:available?[{start_time:details.start,status:'available'}]:[]};
  return{resource:{duration:30,locations:[{kind:'google_conference'}],custom_questions:[{enabled:true,required:true,name:'Do you have WhatsApp?',position:2}]}};
 }};
 return old.call(this,name,...args);
};
const {createNativeBooking,validateBookingDetails}=require(path.join(process.env.SAVVY_TEST_OUTPUT,'native-booking.js'));
const app={id:'app',qualified:true,leadId:'lead',answers:{firstName:'QA',lastName:'Test',email:'qa@example.com',phone:'+12025550148'}};
const details={start:new Date(Date.now()+86400000).toISOString(),timezone:'Asia/Manila',whatsapp:'Yes',notes:''};
(async()=>{
 for(const change of [{start:'bad'},{timezone:'Fake/Zone'},{whatsapp:'maybe'},{notes:'a'.repeat(2001)}])assert.throws(()=>validateBookingDetails({...details,...change}));
 await createNativeBooking(app,details);await createNativeBooking(app,details);assert.equal(posts,1,'replay never creates twice');await createNativeBooking(app,{...details,start:'2020-01-01T00:00:00Z'});assert.equal(posts,1,'saved confirmation remains recoverable after the appointment time');
 records.clear();fail='timeout';await assert.rejects(createNativeBooking(app,details),/BOOKING_UNCERTAIN/);fail='';await assert.rejects(createNativeBooking(app,details),/BOOKING_UNCERTAIN/);assert.equal(posts,2,'uncertain POST is not retried');
 existing={value:{applicationId:'app',status:'active',inviteeUri:'webhook-recovery'}};assert.equal(await createNativeBooking(app,details),'webhook-recovery');assert.equal(posts,2);existing=null;
 records.clear();fail='CALENDLY_409';await assert.rejects(createNativeBooking(app,details),/SLOT_UNAVAILABLE/);fail='';await createNativeBooking(app,details);assert.equal(posts,4,'definitive rejection permits retry');
 records.clear();available=false;await assert.rejects(createNativeBooking(app,details),/SLOT_UNAVAILABLE/);assert.equal(posts,4);available=true;
 current='newer';await assert.rejects(createNativeBooking(app,details),/APPLICATION_CHANGED/);assert.equal(posts,4);
 console.log('PASS native booking: validation, selected-slot check, saved identity, tracking, duplicate guard, uncertain POST protection, webhook recovery and safe rejection retry');
})().catch(e=>{console.error(e);process.exitCode=1});
