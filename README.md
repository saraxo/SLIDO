# SLIDO

Youtube: https://www.youtube.com/watch?v=1Qh4FIfR2V0

(If you do not have time to review the entire code for the project, above is a video where you can see the functionality and the page in action.)

Full Stack application made in Node.js with Postgres database. SLIDO is an app for virtual meetings and events. The task was to make an app with the specifications below. The app has three modules - admin, lecturer and guests.

More detailed specifications

<b>Admin</b>

Admin can perform CRUD operations (Create, Read, Update and Delete) on all lookup tables. He can delete and block users. The admin sees all scheduled lectures and can delete future lectures. Multiple users can have the administrator role. Admin users are added directly through the database. It has the possibility of administration of all users (lecturers) and scheduled lectures, can edit all codebooks used in the system and can edit the list of prohibited words.

<b>Lecturer</b>

The lecturer is a registered user who has a large number of possibilities in the system. The lecturer schedules lectures, shares access data with guests (audience), answer questions, filter questions and more. He has the possibility to register on the system and can simply create lectures. Each lecture is created by entering a code, name, time and repetition rules (e.g once a week until June 15). The lecturer can upload an image that will represent the background of the lecture (cover). The lecturer sees a list of all your lectures, with statistics (number of questions, asked and answered). It has the possibility of sharing the code for access to the lecture. 
The lecturer can delete each question, answer it (goes to the list of answered questions). The lecturer has the possibility of different sorting of lectures (by time, by the number of approvals)
It is possible to receive an email report after each lecture. The mail report has reviews for lectures (or meetings).
The lecturer has the option of sharing the access link for a lecture to the guests emails.

<b>Guests</b>

Guests are users who are not registered.They access a specific lecture via a link or code, have the option of asking questions, approving already asked questions, and more. On the main page guests enter the code and by correctly entering the code, they get a list of all questions asked in that lecture, as well as the possibility of approving the questions asked (liking) or asking new questions. Guests have the opportunity to rate the lecture (from 1 to 5), and these data are ultimately sent via email to the lecturer.




