**Overall plan: 

create a site where people can make a plan for their doctor well visit, add questions and ultimately send it to their notes app or email, etc.

**Interface: 

Users will log in with email and password (we can build this later). At arrival to the site, they should be prompted to pick the well visit they are planning for. They should then be provided with information about the visit (category and sources below).  They should be able to add their own questions. The output will be an document which they can email to themslves (or their partner) or save on their phone notes app. The website should save this, as well, so on future login they see their past questions.

**What is in the document?

First: a report of what is likely to happen at htis visit. 
Second: a list of vaccines that they will be offered. Please use the AAP vaccine document which is included in the /inputs/ folder. This section should also link to this post in ParentData: https://parentdata.org/grown-ups/how-can-you-know-if-vaccines-are-safe/ and this one: https://parentdata.org/babies/your-guide-to-childhood-vaccinations-before-age-2/
Third: a list of milestones their pediatrician will be looking at at this visit. Please use the CDC and AAP milestones, inclued in the /raw/ folder
Fourth: suggest a list of common questions that people would ask at this visit. Allow people to delete these, or a subset of them, and add tehir own.
Fifth: include a short list of age-specific articles from ParentData. You can see good inputs for each age group in the CSV download of BabyData in the /inputs/ folder.

This needs to be somewhat editable, and then allow people to click to generate an email or share with a notes app.

**Functionality:

This will be linked out from ParentData, but can be a stand-alone product with its own login. We can use firebase, I think, and we'll limit the user authentication to paid users on ParentData.

** Where is this living? 

There is a WellVisit file folder, and the github is WellVisitPlanner. 




