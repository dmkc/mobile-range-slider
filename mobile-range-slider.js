/*
 * Mobile Range Slider 
 * A Touch Slider for Webkit / Mobile Safari
 *
 * Forked from:
 * https://github.com/ubilabs/mobile-range-slider
 *
 *
 * @author Ubilabs http://ubilabs.net, 2012
 * @author Dmitry Kichenko, 2013
 *
 * @license MIT License http://www.opensource.org/licenses/mit-license.php
 */

// function.bind() polyfill
// taken from: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError(
        "Function.prototype.bind - what is trying to be bound is not callable"
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
      fToBind = this, 
      fNOP = function() { },
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP ? this : oThis || window,
          aArgs.concat( Array.prototype.slice.call(arguments) )
        );
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// Mixin functionality. Lifted from Underscore.js:
// https://github.com/documentcloud/underscore
function extend(obj) {
    Array.prototype.forEach.call(Array.prototype.slice.call(arguments, 1), 
      function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };


(function(undefined) {
  
  // mapping of event handlers
  var events = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup']
  };

  // constructor
  function MobileRangeSlider(range, options) {
    this.range = range;
    this.options = {};
    var property;
    
    // detect support for Webkit CSS 3d transforms
    this.supportsWebkit3dTransform = (
      'WebKitCSSMatrix' in window && 
      'm11' in new WebKitCSSMatrix()
    );
    
    // cache DOM references
    if (typeof range === 'string'){
      this.range = document.getElementById(range);
    }
    // If element is a range input, read its min/max/value props
    if(this.range.type == 'range')
      options = extend({}, {
        min:   this.range.min | 0,
        max:   this.range.max | 0,
        value: this.range.value | 0,
      }, options)

    extend(this.options, this.defaultOptions, options)

    this.element = this.createElements()  
    // Append slider after the range input and hide the input
    this.range.parentNode.insertBefore(this.element, this.range.nextSibling)
    this.range.style.display = 'none'
        
    this.knob = this.element.getElementsByClassName('knob')[0];
    this.track = this.element.getElementsByClassName('track')[0];
    
    // set context for event handlers
    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    
    // set the inital value
    this.addEvents("start");
    this.setValue(this.options.value);
    
    // update postion on page resize
    window.addEventListener("resize", this.update.bind(this));
  }
  
  // default options
  MobileRangeSlider.prototype.defaultOptions = {
    value: 0, // initial value
    min: 0, // minimum value
    max: 100, // maximum value
    change: null // change callback
  };

  // add event handlers for a given name
  MobileRangeSlider.prototype.addEvents = function(name){
    var list = events[name], 
      handler = this[name],
      all;
    
    for (all in list){
      this.element.addEventListener(list[all], handler, false);
    }
  };
  
  // remove event handlers for a given name
  MobileRangeSlider.prototype.removeEvents = function(name){ 
    var list = events[name], 
      handler = this[name],
      all;
      
    for (all in list){
      this.element.removeEventListener(list[all], handler, false);
    }
  };

  MobileRangeSlider.prototype.createElements = function(){
    var el = document.createElement('div'),
        track = document.createElement('div'),
        knob = document.createElement('div')

    el.className = 'slider'
    track.className = 'track'
    knob.className = 'knob'
    el.appendChild(track)
    el.appendChild(knob)
    return el
  }
  
  // start to listen for move events
  MobileRangeSlider.prototype.start = function(event) {
    this.addEvents("move");
    this.addEvents("end");
    this.element.classList.add('active');
    this.handle(event);
  };
  
  // handle move events
  MobileRangeSlider.prototype.move = function(event) {
    this.handle(event);
  }; 

  // stop listening for move events
  MobileRangeSlider.prototype.end = function() {
    this.removeEvents("move");
    this.removeEvents("end");

    this.element.classList.remove('active');
  };
  
  // update the knob position
  MobileRangeSlider.prototype.update = function() {
    this.setValue(this.value);
  };
  
  // set the new value of the slider
  MobileRangeSlider.prototype.setValue = function(value) {
    value = value || this.options.min
    
    value = Math.min(value, this.options.max);
    value = Math.max(value, this.options.min);
    
    var 
      knobWidth = this.knob.offsetWidth,
      trackWidth = this.track.offsetWidth,
      range = this.options.max - this.options.min,
      width = trackWidth - knobWidth,
      position = Math.round((value - this.options.min) * width / range);
    
    this.setKnobPosition(position);
    
    this.value = value;
    this.callback(value);
  };
  
  MobileRangeSlider.prototype.setKnobPosition = function(x){
    // use Webkit CSS 3d transforms for hardware acceleration if available 
    if (this.supportsWebkit3dTransform) {
      this.knob.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    } else {
      this.knob.style.webkitTransform = 
      this.knob.style.MozTransform = 
      this.knob.style.msTransform = 
      this.knob.style.OTransform = 
      this.knob.style.transform = 'translateX(' + x + 'px)';
    }
  };

  // handle a mouse event
  MobileRangeSlider.prototype.handle = function(event){
    event.preventDefault();
    if (event.targetTouches){ event = event.targetTouches[0]; }
  
    var position = event.pageX, 
      element,
      knobWidth = this.knob.offsetWidth,
      trackWidth = this.track.offsetWidth,
      width = trackWidth - knobWidth,
      range = this.options.max - this.options.min,
      value;
      
    for (element = this.element; element; element = element.offsetParent){
      position -= element.offsetLeft;
    }
    
    // keep knob in the bounds
    position += knobWidth / 2;
    position = Math.min(position, trackWidth);
    position = Math.max(position - knobWidth, 0);
  
    this.setKnobPosition(position);
  
    // update
    value = this.options.min + Math.round(position * range / width);
    this.setValue(value);
  };

  // call callback with new value and update value of range input
  MobileRangeSlider.prototype.callback = function(value) { 
    if (this.options.change){
      this.options.change(value);
    }
    this.range.setAttribute('value', value)
  };

  //public function
  window.MobileRangeSlider = MobileRangeSlider;
})();