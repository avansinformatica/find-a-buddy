# find-a-buddy
This demo project shows you how to build a full stack application with (possibly) multiple frontends, multiple backends and using multiple nosql databases in a monorepo.

The web page lets you connect with other students to ask for help with your homework or personal projects or lets you offer your knowledge and skills to others.

The idea is that you advertise what topics you can tutor and what topics you want help with. Then when you find a suitable tutor you send them an invite for a meetup. After the meetup you review how well they helped you. These reviews can help everyone search for better tutors.

## Backend
All endpoints are [documented in Postman](https://documenter.getpostman.com/view/9370249/2s8YeuKWHL#auth-info-68499916-813d-4241-81ec-ba006d587eef).

Currently all endpoints are handled by one NestJS backend. Plans are to separate out the recommendation endpoints in the future.

### Data API
Handles user authentication and CRUD operations on all data.

### Recommendation API
Handles endpoints to get recommended tutors.

This backend can also check tokens issued by the other backend.

In the future the recommendation endpoints will move to a separate NestJS app to demonstrate how multiple backends can work together in an Nx monorepo.

## Frontend
WIP

## Running locally
After cloning the repo you can run the Angular app in dev mode with `nx serve`.

[Instructions for starting backend in dev mode]

## Deployment
This app is continuously deployed... more details are to follow!
