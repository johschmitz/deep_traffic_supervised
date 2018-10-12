
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 5;
patchesAhead = 50;
patchesBehind = 10;
trainIterations = 1000000;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 10

var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;
var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

var layer_defs = [];
    layer_defs.push({
    type: 'input',
    out_sx: 1,
    out_sy: 1,
    out_depth: network_size
});
layer_defs.push({
   type: 'fc',
   num_neurons: 40,
   activation: 'relu'
});
layer_defs.push({
   type: 'fc',
   num_neurons: 40,
   activation: 'relu'
});
layer_defs.push({
   type: 'fc',
   num_neurons: 40,
   activation: 'relu'
});
layer_defs.push({
   type: 'fc',
   num_neurons: 40,
   activation: 'relu'
});
layer_defs.push({
   type: 'fc',
   num_neurons: 15,
   activation: 'relu'
});
layer_defs.push({
    type: 'regression',
    num_neurons: num_actions
});

var tdtrainer_options = {
    learning_rate: 0.001,
    momentum: 0.0,
    batch_size: 32,
    l2_decay: 0.01
};

var opt = {};
//opt.random_action_distribution=[0.2,0.15,0.05,0.3,0.3]
opt.temporal_window = temporal_window;
opt.experience_size = 30000;
opt.start_learn_threshold = 5000;
opt.gamma = 0.9;
opt.learning_steps_total = 10000;
opt.learning_steps_burnin = 1000;
opt.epsilon_min = 0.1;
opt.epsilon_test_time = 0.0;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

brain = new deepqlearn.Brain(num_inputs, num_actions, opt);


// we require some addition global variables
supervision = false;
// check for document to avoid crashing in webworker
if (typeof self.document != 'undefined') {
    speedBox = document.getElementsByClassName('speedBox')[0];
    speedBox.innerHTML = 'Speed:<br><span style="font-size:16pt;" id="mph">0</span> mph<br>\
                       Cars Passed: <br><span style="font-size:16pt;" id="passed">0</span><br>\
                       Supervision<br>(activate with<br>"s" key, arrow keys<br> for steering):<br><span id="supervision" style="font-size:16pt">Off</span><br>\
                       Learning<br>(activate with<br>"l" key):<br><span id="learning" style="font-size:16pt">Off</span><br>\
                       Last Action<br><span id="last_action" style="font-size:16pt">None</span>';
    span_supervision = document.getElementById('supervision');
    span_learning = document.getElementById('learning');
    span_last_action = document.getElementById('last_action');
}

pressed = {};
window.onkeydown = function(event){
    event = event || window.event;
    pressed[event.keyCode] = true;
    //console.log(event.keyCode);
}

print_action = function(action) {
    var action_str;
    switch (action) {
        case 0:
            action_str = 'None';
            break;
        case 1:
            action_str = '^';
            break;
        case 2:
            action_str = 'V';
            break;
        case 3:
            action_str = '<';
            break;
        case 4:
            action_str = '>';
            break;
        default:
            action_str = '';
            console.log('Error: Wrong action, must be in {0,..,4}.');
    }
    return(action_str)
}

learn = function (state, lastReward) {
    console.log("Being called from " + arguments.callee.caller.toString());
    var action_net = 0;
    var action_supervisor = 0;
    var action = 0;

    if (pressed["83"]) {
        // s key activates supervision
        if (supervision == false) {
            supervision = true;
            // enable interactive learning
            span_supervision.innerHTML = 'On';
        }
        else {
            supervision = false;
            // disable interactive learning
            span_supervision.innerHTML = 'Off';
        }
    } else if (pressed["76"]) {
        // l key activates learning
        if (brain.learning == false) {
            brain.learning = true;
            span_learning.innerHTML = 'On';
        } else {
            brain.learning = false;
            span_learning.innerHTML = 'Off';            
        }
        console.log('brain.learning: '+brain.learning)
    } else if (pressed["37"]) {
        // left arrow, go left
        action_supervisor = 3;
    } else if (pressed["38"]) {
        // up arrow, accelerate
        action_supervisor = 1;
    } else if (pressed["39"]) {
        // right arrow, go right
        action_supervisor = 4;
    } else if (pressed["40"]) {
        // down arrow, decelerate
        action_supervisor = 2;
    } 
    // reset button states
    pressed = {};

    if (supervision == true) {
        // train based on the supervisors actions
        //console.log('Supervisor action: ');
        //print_action(action_supervisor)
        action_net = brain.forward(state);
        var reward;
        if (action_supervisor == action_net) {
            reward = 3;
        } else {
            reward = 0;
        }
        brain.backward(reward);
        action = action_supervisor;
    } else {
        // ignore supervision and use reinforcement learning
        brain.backward(lastReward);
        action_net = brain.forward(state);
        action = action_net;
    }

    span_last_action.innerHTML = print_action(action);;
    draw_net();
    draw_stats();

    return action;
}

//]]>
