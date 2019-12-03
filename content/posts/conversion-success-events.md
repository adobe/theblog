# Conversion (Success Events) \[Inside Omniture SiteCatalyst]

### 

08-08-2008

**SiteCatalyst Conversion Variables  
**Omniture [SiteCatalyst](http://www.omniture.com/en/products/web_analytics/sitecatalyst) breaks its variables into two types: Traffic and Conversion. As discussed in my [last post](http://blogs.omniture.com/2008/08/05/traffic-variables-sprops/), Traffic Variables allow you to segment traffic metrics (i.e. Page Views) and utilize Pathing, whereas Conversion Variables allow you to quantify and segment the success actions taken by your site visitors. The Conversion area of SiteCatalyst is made up of two distinct variable types – Success Events and Conversion Variables (also known as eVars). In this post I will discuss Success Events, followed by Conversion Variables in my next posts.

**Success Events & KPI’s**  
Before exploring Success Events, it is worthwhile to discuss [Key Performance Indicators](http://en.wikipedia.org/wiki/Key_performance_indicators) (or KPI’s). Hopefully you are familiar with the term, but just in case, KPI’s are the metrics used to determine the health or success of your website.

If the goal of your website is to get visitors to purchase things then your KPI’s might be Revenue, Orders & Units. Alternatively, if the goal of your website is to generate leads, then you may monitor a “Leads Generated” KPI. The reason I bring up KPI’s here is because most website KPI’s take the form of Success Events in SiteCatalyst so the two go hand in hand. When I begin working with an existing client, the first thing I look at is whether the key actions they want visitors to take on their site are defined as Success Events and if so whether these Success Events have data. Unfortunately, more often than not, I find that clients have done much more with their Traffic Variables than they have with their Conversion Variables.

**SiteCatalyst Success Events**  
SiteCatalyst Success Events are Conversion Variables that count the number of times site visitors complete an action on your site. Unlike [Traffic Variables](http://blogs.omniture.com/2008/08/05/traffic-variables-sprops/) which serve as dimensions or breakdowns of a Page View/Visit/Unique Visitor metric, Success Events are always numbers. Through tagging, you tell SiteCatalyst when users have taken the action(s) that you want them to take and Success Events are increased accordingly. Therefore, each SiteCatalyst Success Event has an associated graph that shows its metric total for any given timeframe (see example below).

Success Events can be either Standard or Custom. Standard Success Events include a select few actions that are prevalent on retail websites such as Revenue, Orders, Units, Cart Additions, etc… Custom Success Events are available for use for any site action you deem worthy of tracking. Omniture provides the ability to have up to 86 Success Events, though many of these are reserved for use in Genesis Partner integrations (future topic). As a rule of thumb, I tell my clients that if there is an action on the website that is **fundamental** to the existence of the website, it should be tracked as a Success Event. If you or one of your co-workers won’t get promoted (or fired!) based upon the outcome of the Success Event, it may not be worthy of being a Success Event. In reality, I find that most of my clients use fewer than 20 success events, mainly to avoid “analysis paralysis!”

**Conversion vs. Traffic**  
One area where I see clients get confused is in the relationship between SiteCatalyst Traffic Variables (also known as sProps) and Conversion Variables. In SiteCatalyst, there is a clear distinction between these variable types such that each variable type has its own specific purpose. When you think of Traffic Variables you should think about Page Views, Unique Visitors and Pathing. When you think about Conversion Variables you should think about Purchases, Lead Form Submissions, etc…  


In SiteCatalyst, you would never attempt to segment/breakdown Success Events by a Traffic Variable (You can do this in Omniture Discover, but not in SiteCatalyst). For example, in my [last post](http://blogs.omniture.com/2008/08/05/traffic-variables-sprops/) we saw an example where Page Views were broken down by language (English or Spanish). In SiteCatalyst, you would not breakdown a Revenue Success Event by the Language Traffic Variable to see Revenue where visitors preferred Spanish. This is because the primary purpose of Traffic Variables is to count Page Views and enable [Pathing](http://blogs.omniture.com/2008/10/13/pathing-analysis-inside-omniture-sitecatalyst/), not break down Success Events. However, don’t panic because in subsequent posts we will learn how [Conversion Variables](http://blogs.omniture.com/2008/08/13/conversion-variables-part-i/) allow you to do this and much, much more!

**Real-World Example**  
Let’s say go back to our fictitious Omniture client Greco Inc., which has one of its web properties in the Online Education space. A key component of their online education website is to get visitors to view a demo of an online course so they can get a flavor of the overall experience of being an online student. In this case, when the visitor clicks to view the Course Demo, Greco Inc.’s marketing manager works with IT to set a Success Event and thereafter can track the progress of this metric using the associated SiteCatalyst report:

In summary, this post covered the basics surrounding Success Events and when they should be used. In future posts I will cover the following additional items related to Success Events:

1.  Adding Success Event reports to dashboards for dissemination to website stakeholders
2.  Downloading Success Event data to [Microsoft Excel](http://blogs.omniture.com/2008/09/23/omniture-excelclient-inside-omniture-sitecatalyst/) so it can be merged with other data
3.  Using Success Event data in SiteCatalyst Calculated Metrics and Conversion Funnels
4.  Setting Alerts to be notified when Success Event data changes
5.  Ensuring Success Events are not set more than once (de-duplication)
6.  More advanced uses of success events

Stay tuned for my next posts in which I will round out the conversation on SiteCatalyst variables by discussing [Conversion Variables](http://blogs.omniture.com/2008/08/13/conversion-variables-part-i/)…



Have a question about anything related to SiteCatalyst? Is there something on your website that you would like to report on, but don’t know how? Do you have any tips or best practices you want to share? If so, please send me an e-mail at [insidesitecatalyst@omniture.com](mailto:insidesitecatalyst@omniture.com) and I will do my best to answer it right here on the blog so everyone can learn! (Don’t worry – I won’t use your name or company name!)



---

by Adam Greco  
posted on 08-08-2008

---

Topics:

---

Products: Analytics
