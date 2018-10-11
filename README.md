# DeepTraffic (semi-)supervised

## Basics
This is in fact a kind of semi-supervised model for the MIT DeepTraffic excercise.
The user is able to control the car with the `arrow` keys.
Additional keys are `s` to activate the supervised mode and `l` to activate the interactive learning process.
The car can learn in the supervised as well as in the reinforcement learning mode.

![alt text](https://github.com/johschmitz/deep_traffic_supervised/blob/master/screenshot.png "Screenshot of DeepTraffic Website")

## Idea

When supervision is active the car is rewarded for following the actions of the user.
On the other hand, when supervision is turned off, the Q-learning approach is followed as implemented in the baseline DeepTraffic.
One idea is to take over whenever the car gets stuck in a difficult situation.
Another idea is that it will be able to learn faster in the beginning when it is totally untrained.

## How to run
Download the `semi_supervised_model.js` file and load it into the [MIT DeepTraffic](https://selfdrivingcars.mit.edu/deeptraffic/) website.
It is possible to set the simulation to `fast` mode.

### Note
Tested with version 2.0.


