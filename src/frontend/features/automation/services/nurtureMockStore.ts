// In-memory mock store for nurture SMS campaigns.
// This is used by Next.js API routes under /api/automation/nurture
// and can be replaced by a real database or microservice later.

import { NurtureConfig } from '../types/nurture';

let nurtureConfig: NurtureConfig = {
  schedule: {
    id: 'default',
    label: 'Default Nurture Schedule',
    activeDays: {
      sunday: false,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
    },
  },
  campaigns: [
    {
      id: 'still_on_cloud',
      name: 'Still on Leads Cloud - Nurture',
      leadStatus: 'still_on_cloud',
      description: 'Long-term nurture sequence for owners still thinking about selling',
      isActive: true,
      steps: [
        {
          id: 'still_on_cloud_2',
          reason: 'Still on Cloud',
          dayOffset: 2,
          smsTemplate:
            "Hey [first_name], are you available to talk about selling your home? We are interested in acquiring a few more properties in [city]. Please give me a call back at this number so we can make an offer. Looking forward to speaking with you!",
          isActive: true,
        },
        {
          id: 'still_on_cloud_3',
          reason: 'Still on Cloud',
          dayOffset: 3,
          smsTemplate:
            "Hi [first_name], did you have a minute for us to give you an offer on [address1]? Hope all is well and we look forward to talking with you. Thanks Mary",
          isActive: true,
        },
        {
          id: 'still_on_cloud_4',
          reason: 'Still on Cloud',
          dayOffset: 4,
          smsTemplate:
            "Hey [first_name], I know you have a hectic schedule. When you have a couple minutes to chat about your home at [address1] we actually buy properties AS-IS and cover ALL CLOSING COST. I look forward to hearing from you. Thanks",
          isActive: true,
        },
        {
          id: 'still_on_cloud_5',
          reason: 'Still on Cloud',
          dayOffset: 5,
          smsTemplate:
            "Hey [first_name], just curious did you have the time to chat today about [address1]?",
          isActive: true,
        },
        {
          id: 'still_on_cloud_8',
          reason: 'Still on Cloud',
          dayOffset: 8,
          smsTemplate:
            "Hi [first_name], just wanted to say hi. My finance department said we are still buying in the area. We can CLOSE QUICK and we BUY AS-IS. Do you have some time to chat? Thanks Mary",
          isActive: true,
        },
        {
          id: 'still_on_cloud_10',
          reason: 'Still on Cloud',
          dayOffset: 10,
          smsTemplate:
            "Hi [first_name], Mary again with Presidential Digs. We reviewed your property about a week ago and are looking at your house and a few others in [city] to purchase for our portfolio. Just a reminder our offer is based on a cash offer and closing costs. If you have time to chat give me a call. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'still_on_cloud_14',
          reason: 'Still on Cloud',
          dayOffset: 14,
          smsTemplate:
            "Hi [first_name], are you still interested in hearing an offer on [address1]? We can buy houses AS-IS and cover ALL CLOSING COST. Please give me a call.",
          isActive: true,
        },
        {
          id: 'still_on_cloud_30',
          reason: 'Still on Cloud',
          dayOffset: 30,
          smsTemplate:
            "Hey [first_name], I wanted to follow up and see if you are still interested in selling at [address1]? Hope all is well. Thanks Mary",
          isActive: true,
        },
        {
          id: 'still_on_cloud_60',
          reason: 'Still on Cloud',
          dayOffset: 60,
          smsTemplate:
            "Hi [first_name], hope all has been well. It has been awhile since we last spoke about [address1]. With everything going on in the real estate market things have changed. Do you have time to talk this week? We are still buying in this area. Thanks Mary",
          isActive: true,
        },
        {
          id: 'still_on_cloud_90',
          reason: 'Still on Cloud',
          dayOffset: 90,
          smsTemplate:
            "Hey [first_name], just wanted to reach out again now that the market is settling. Have you thought about selling [address1]? If so we would love to make an offer. WE COVER ALL CLOSING COST and CAN CLOSE QUICK! Look forward to talking with you. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'still_on_cloud_120',
          reason: 'Still on Cloud',
          dayOffset: 120,
          smsTemplate:
            "Hi [first_name], I figured I'd reach out and see how things are going. With everything going on in the real estate market I wanted to see if anything has changed on your end and if you are still interested in selling [address1]? We still have buyers interested in making an OFFER.",
          isActive: true,
        },
        {
          id: 'still_on_cloud_150',
          reason: 'Still on Cloud',
          dayOffset: 150,
          smsTemplate:
            "Hey [first_name], did you ever sell your property on [address1]? If not and you are still looking to sell we would love to chat. This is Mary with Presidential Digs :)",
          isActive: true,
        },
        {
          id: 'still_on_cloud_180',
          reason: 'Still on Cloud',
          dayOffset: 180,
          smsTemplate:
            "Hi [first_name], just wanted to follow up. We are still buying in the area and looking at your area as one of our target markets. If you have a couple minutes we could look at making you an AS-IS cash offer on [address1]. Please give me a call when you have a minute. Thanks Mary",
          isActive: true,
        },
        {
          id: 'still_on_cloud_270',
          reason: 'Still on Cloud',
          dayOffset: 270,
          smsTemplate:
            "Hey [first_name], hope all is well. It has been awhile since we spoke about [address1]. We are still interested in purchasing in this area. Do you have time to hop on another call?",
          isActive: true,
        },
        {
          id: 'still_on_cloud_330',
          reason: 'Still on Cloud',
          dayOffset: 330,
          smsTemplate:
            "Good afternoon [first_name], are you open to hearing our offer again on [address1]? I think it's worth a quick phone call. Thanks",
          isActive: true,
        },
        {
          id: 'still_on_cloud_365',
          reason: 'Still on Cloud',
          dayOffset: 365,
          smsTemplate:
            "Hey [first_name], are you ever still open to hearing offers on [address1]? This market is always changing. If you are open we would love to chat. Thanks Mary",
          isActive: true,
        },
      ],
    },
    {
      id: 'working_with_competitor',
      name: 'Working with Competitor',
      leadStatus: 'working_with_competitor',
      description: 'Stay-top-of-mind sequence for leads working with other buyers/agents',
      isActive: true,
      steps: [
        {
          id: 'working_competitor_7',
          reason: 'Working with Competitor',
          dayOffset: 7,
          smsTemplate:
            "Hi [first_name], hope all is well. I wanted to follow up and see how everything is going with the closing of your home? I know you ended up working with another company. If you ever need anything please let me know. We are still interested in buying the home :) Presidential Digs",
          isActive: true,
        },
        {
          id: 'working_competitor_30',
          reason: 'Working with Competitor',
          dayOffset: 30,
          smsTemplate:
            "Good afternoon [first_name], are you still wanting to make sure you close on your property [address1]? If for any reason the sale did NOT go through we would still love to make an offer. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'working_competitor_45',
          reason: 'Working with Competitor',
          dayOffset: 45,
          smsTemplate:
            "Hi [first_name], I wanted to follow up and see if everything went smooth with the close of your home on [address1]? If for any reason the sale did NOT go through we would still love to make an OFFER. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'working_competitor_60',
          reason: 'Working with Competitor',
          dayOffset: 60,
          smsTemplate:
            "Hey [first_name], hope all is well. I wanted to follow up and see how everything is going with the closing of your home? I know you ended up working with a different company. If you ever need anything please let me know. We are still interested in buying the home :) Presidential Digs",
          isActive: true,
        },
        {
          id: 'working_competitor_90',
          reason: 'Working with Competitor',
          dayOffset: 90,
          smsTemplate:
            "Good afternoon [first_name], are you still wanting to make sure you close on your property [address1]? If not or if you are ready to move we can do a cash offer and quick closing! Give me a call.",
          isActive: true,
        },
        {
          id: 'working_competitor_120',
          reason: 'Working with Competitor',
          dayOffset: 120,
          smsTemplate:
            "Hey [first_name], I wanted to follow up and see how things are going? We made an offer on [address1] a couple months ago. Did you ever end up selling it? Thanks Mary",
          isActive: true,
        },
        {
          id: 'working_competitor_150',
          reason: 'Working with Competitor',
          dayOffset: 150,
          smsTemplate:
            "Good afternoon [first_name], are you open to hearing our offer again on [address1]? I think it's worth a quick phone call. Thanks",
          isActive: true,
        },
        {
          id: 'working_competitor_180',
          reason: 'Working with Competitor',
          dayOffset: 180,
          smsTemplate:
            "Hey [first_name], are you still open to hearing offers on [address1]? Believe it or not we are still buying homes AS-IS and ALL CASH in this crazy market. Thanks Mary",
          isActive: true,
        },
        {
          id: 'working_competitor_260',
          reason: 'Working with Competitor',
          dayOffset: 260,
          smsTemplate:
            "Hi [first_name], hope all has been well. I wanted to follow up and see how everything is going with the close of your home on [address1]? If for any reason the sale did NOT go through we would still love to make an offer. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'working_competitor_320',
          reason: 'Working with Competitor',
          dayOffset: 320,
          smsTemplate:
            "Hey [first_name], I know we got a TON of calls about [address1] and most of them are serious buyers. With that being said WE ARE SERIOUS and are actively buying in this area. Do you have a couple minutes we can chat and introduce our company and make a REAL OFFER? Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'working_competitor_365',
          reason: 'Working with Competitor',
          dayOffset: 365,
          smsTemplate:
            "Hi [first_name], hope all is well. I wanted to follow up and see how everything is going with [address1]? If for any reason things did NOT go through we would still love to make an OFFER. Thanks Mary :)",
          isActive: true,
        },
      ],
    },
    {
      id: 'not_interested',
      name: 'Not Interested',
      leadStatus: 'not_interested',
      description: 'Low-frequency check-in sequence for leads currently not interested',
      isActive: true,
      steps: [
        {
          id: 'not_interested_30',
          reason: 'Not Interested',
          dayOffset: 30,
          smsTemplate:
            "Hey [first_name], are you still open to hearing offers on [address1]? Believe it or not we are still buying homes AS-IS and ALL CASH in this crazy market. Thanks Mary",
          isActive: true,
        },
        {
          id: 'not_interested_60',
          reason: 'Not Interested',
          dayOffset: 60,
          smsTemplate:
            "Hi [first_name], hope all has been well. It's been awhile since we last spoke about [address1]. With everything shifting in the market I wanted to see if we can make an offer. There is no better time to sell. We can buy AS-IS and pay CASH. Please give me a call. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'not_interested_120',
          reason: 'Not Interested',
          dayOffset: 120,
          smsTemplate:
            "Hi [first_name], did you ever sell the property on [address1]? The market has been pretty active in [city] and we are still interested in buying. Thanks Mary",
          isActive: true,
        },
        {
          id: 'not_interested_180',
          reason: 'Not Interested',
          dayOffset: 180,
          smsTemplate:
            "Hey [first_name], just wanted to see if you are still open to hearing an offer on [address1]? Thanks Mary",
          isActive: true,
        },
        {
          id: 'not_interested_230',
          reason: 'Not Interested',
          dayOffset: 230,
          smsTemplate:
            "Hi [first_name], we would still want to make an offer on [address1]. We can PAY CASH and cover ALL CLOSING COST and pay CASH for the home. We can close super quick as well. Are you still open to selling? Thanks Mary",
          isActive: true,
        },
        {
          id: 'not_interested_300',
          reason: 'Not Interested',
          dayOffset: 300,
          smsTemplate:
            "Hi [first_name], good afternoon. Have you given it any more thought about selling [address1]? We are still buying AS-IS and can cover ALL CLOSING COST. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'not_interested_365',
          reason: 'Not Interested',
          dayOffset: 365,
          smsTemplate:
            "Hey [first_name], hope all is well. Have you ever sold the property on [address1]? This market is crazy and we are still buying. Thanks Mary",
          isActive: true,
        },
      ],
    },
    {
      id: 'wants_retail',
      name: 'Wants Retail',
      leadStatus: 'wants_retail',
      description: 'Follow-up sequence for sellers who want full retail price',
      isActive: true,
      steps: [
        {
          id: 'wants_retail_21',
          reason: 'Wants Retail',
          dayOffset: 21,
          smsTemplate:
            "Hey [first_name], we just bought another home in [city]. Now is a great time to sell and take advantage of the speed and convenience we can offer you. Are you still interested in selling? We can offer a quick closing!",
          isActive: true,
        },
        {
          id: 'wants_retail_85',
          reason: 'Wants Retail',
          dayOffset: 85,
          smsTemplate:
            "Hello [first_name], your offer came back under review and we would like to jump back on a call to go over it. Are you free to chat and see if we can make this work this time?",
          isActive: true,
        },
        {
          id: 'wants_retail_165',
          reason: 'Wants Retail',
          dayOffset: 165,
          smsTemplate:
            "Hi [first_name], I wanted to reach out and see if you are ready to revisit our offer on [address1]? We may be able to get closer to your number. The market is shifting fast. Thanks Mary",
          isActive: true,
        },
        {
          id: 'wants_retail_225',
          reason: 'Wants Retail',
          dayOffset: 225,
          smsTemplate:
            "Hey [first_name], did you ever end up selling [address1]? We are still actively buying in this area. Do you have time to chat?",
          isActive: true,
        },
        {
          id: 'wants_retail_365',
          reason: 'Wants Retail',
          dayOffset: 365,
          smsTemplate:
            "Hey [first_name], I know every time I reach out I mention selling the house. Today I just wanted to say I HOPE ALL IS WELL and I’m sending some positive vibes your way! Have an AMAZING DAY!! Thanks Mary :)",
          isActive: true,
        },
      ],
    },
    {
      id: 'no_longer_want_to_sell',
      name: 'No Longer Want To Sell',
      leadStatus: 'no_longer_want_to_sell',
      description: 'Very low-frequency check-ins for sellers who are off the market',
      isActive: true,
      steps: [
        {
          id: 'no_longer_90',
          reason: 'No Longer Want To Sell',
          dayOffset: 90,
          smsTemplate:
            "Hey [first_name], with the market shifting have you thought about selling [address1]? If so we would love to chat with you. Thanks Mary",
          isActive: true,
        },
        {
          id: 'no_longer_150',
          reason: 'No Longer Want To Sell',
          dayOffset: 150,
          smsTemplate:
            "Hi [first_name], just bought another home in the area. Now is a great time to sell and take advantage of the speed and convenience we can offer you. Are you still interested in selling? We can offer a quick close.",
          isActive: true,
        },
        {
          id: 'no_longer_230',
          reason: 'No Longer Want To Sell',
          dayOffset: 230,
          smsTemplate:
            "Hi [first_name], I wanted to follow up and see how things are going? We made an offer on [address1] a couple months ago. Did you ever end up selling it? Thanks Mary",
          isActive: true,
        },
        {
          id: 'no_longer_320',
          reason: 'No Longer Want To Sell',
          dayOffset: 320,
          smsTemplate:
            "Hey [first_name], hope all has been well. Have you given it any more thought about selling [address1]? The market is moving and we are still buying. Thanks Mary",
          isActive: true,
        },
        {
          id: 'no_longer_370',
          reason: 'No Longer Want To Sell',
          dayOffset: 370,
          smsTemplate:
            "Hi [first_name], hope all has been well. Just wanted to reach out to let you know that we are still making offers on properties in [city]. Has selling crossed your mind lately?",
          isActive: true,
        },
      ],
    },
    {
      id: 'rejected_offer',
      name: 'Rejected Offer',
      leadStatus: 'rejected_offer',
      description: 'Follow-up sequence for leads who rejected our offer',
      isActive: true,
      steps: [
        {
          id: 'rejected_10',
          reason: 'Rejected offer',
          dayOffset: 10,
          smsTemplate:
            "Hi [first_name], I know it has been awhile since we spoke about [address1]. We are still interested in purchasing the house. Do you have time to hop on another call?",
          isActive: true,
        },
        {
          id: 'rejected_30',
          reason: 'Rejected offer',
          dayOffset: 30,
          smsTemplate:
            "Hey [first_name], I wanted to follow up and see how things are going? We made an offer on [address1] a couple months ago. Did you ever end up selling it?",
          isActive: true,
        },
        {
          id: 'rejected_90',
          reason: 'Rejected offer',
          dayOffset: 90,
          smsTemplate:
            "Hello [first_name], we just finished up a couple projects and wanted to see if you’ve given any thought about selling [address1]? Thanks Mary",
          isActive: true,
        },
        {
          id: 'rejected_155',
          reason: 'Rejected offer',
          dayOffset: 155,
          smsTemplate:
            "Hi [first_name], just wanted to check in and see if you are ready to finally sell [address1]? Thanks Mary",
          isActive: true,
        },
        {
          id: 'rejected_220',
          reason: 'Rejected offer',
          dayOffset: 220,
          smsTemplate:
            "Hey [first_name], please give me a call. We would like to make a competitive CASH OFFER on the [address1] property. Thanks",
          isActive: true,
        },
        {
          id: 'rejected_270',
          reason: 'Rejected offer',
          dayOffset: 270,
          smsTemplate:
            "Good afternoon [first_name], we reviewed your property about a week ago and are looking at your house and a few others in [city] to purchase for our portfolio. Just a reminder our offer is based on an AS-IS and CASH offer. If you have time to chat give me a call. Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'rejected_365',
          reason: 'Rejected offer',
          dayOffset: 365,
          smsTemplate:
            "Hi [first_name], please give me a call. We would like to make a competitive CASH OFFER on the [address1] property. Thanks",
          isActive: true,
        },
      ],
    },
    {
      id: 'interested_not_ready_now',
      name: 'Interested Not Ready Now',
      leadStatus: 'interested_not_ready_now',
      description: 'Nurture sequence for leads who are interested but not ready yet',
      isActive: true,
      steps: [
        {
          id: 'interested_not_ready_30',
          reason: 'Interested Not Ready Now',
          dayOffset: 30,
          smsTemplate:
            "Hey [first_name], we just bought another home in the area. Now is a great time to sell and take advantage of the speed and convenience we can offer you. Are you still interested in selling? We can offer a quick close.",
          isActive: true,
        },
        {
          id: 'interested_not_ready_90',
          reason: 'Interested Not Ready Now',
          dayOffset: 90,
          smsTemplate:
            "Hi [first_name], I am following up as you requested. We are currently buying a few more properties and yours came to mind. Are you still interested in selling? Please give me a call!",
          isActive: true,
        },
        {
          id: 'interested_not_ready_150',
          reason: 'Interested Not Ready Now',
          dayOffset: 150,
          smsTemplate:
            "Hey [first_name], we just finished a remodel in [city] and are looking now for a new home to invest in. We are ready to make an offer for you. What is a good time to hop on a quick call? Looking forward to speaking again!",
          isActive: true,
        },
        {
          id: 'interested_not_ready_220',
          reason: 'Interested Not Ready Now',
          dayOffset: 220,
          smsTemplate:
            "Hey [first_name], we are still looking to acquire a couple more properties. Are you still interested in selling [address1]? Please give me a call. Thanks Mary",
          isActive: true,
        },
        {
          id: 'interested_not_ready_310',
          reason: 'Interested Not Ready Now',
          dayOffset: 310,
          smsTemplate:
            "Hi [first_name], hope all has been well. It's been awhile since we last spoke about [address1]. With everything shifting in the market I wanted to see if we can make an offer. There is no better time to sell. We can buy AS-IS and pay CASH. Please give me a call. Thanks Mary :)",
          isActive: true,
        },
      ],
    },
    {
      id: 'listed_with_realtor',
      name: 'Listed With Realtor',
      leadStatus: 'listed_with_realtor',
      description: 'Check-in sequence for leads who listed with a realtor',
      isActive: true,
      steps: [
        {
          id: 'listed_realtor_60',
          reason: 'Listed With Realtor',
          dayOffset: 60,
          smsTemplate:
            "Hey [first_name], hope all is well. I wanted to follow up and see if your realtor ever sold the property on [address1]? If not and you are still interested in making a CASH OFFER let’s connect. We can still buy AS-IS and cover ALL CLOSING COST. Thanks Mary",
          isActive: true,
        },
        {
          id: 'listed_realtor_120',
          reason: 'Listed With Realtor',
          dayOffset: 120,
          smsTemplate:
            "Hi [first_name], I know a lot has happened with the real estate market in the last few months. If selling is something you are still interested in doing please give me a ring. Thanks Mary",
          isActive: true,
        },
        {
          id: 'listed_realtor_190',
          reason: 'Listed With Realtor',
          dayOffset: 190,
          smsTemplate:
            "Hi [first_name], hope all is well. It has been a little bit since we spoke. We are still buying AS-IS homes and can cover ALL CLOSING COST and pay CASH for the home. We can close QUICK as well. Are you still open to selling [address1]? Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'listed_realtor_260',
          reason: 'Listed With Realtor',
          dayOffset: 260,
          smsTemplate:
            "Hey [first_name], I know we got a TON of calls about [address1] and most of them are serious buyers. With that being said WE ARE SERIOUS and are actively buying in this area. Do you have a couple minutes we can chat and introduce our company and make a REAL OFFER? Thanks Mary :)",
          isActive: true,
        },
        {
          id: 'listed_realtor_320',
          reason: 'Listed With Realtor',
          dayOffset: 320,
          smsTemplate:
            "Hi [first_name], hope all has been well. Just wanted to reach out again now that the market is settling. Have you thought about selling [address1]? If so we would love to chat.",
          isActive: true,
        },
      ],
    },
  ],
};

export function getNurtureConfig(): NurtureConfig {
  return nurtureConfig;
}

export function updateNurtureConfig(update: Partial<NurtureConfig>): NurtureConfig {
  nurtureConfig = {
    ...nurtureConfig,
    ...update,
    campaigns: update.campaigns ?? nurtureConfig.campaigns,
    schedule: update.schedule ?? nurtureConfig.schedule,
  };
  return nurtureConfig;
}


