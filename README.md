# Mobile Range Slider 
## A Touch Slider for Webkit / Mobile Safari

This lightweight JavaScript range slider works on mobile devices such 
as iOS or Android without any dependencies such as jQuery. It basically
restyles the existing `input[type=range]` in a mobile-friendly way, and
delegates value changes to the underlying range input.

### Basic Usage
The constructor takes an ID or reference to an `input` of type
`range`. 

```js
new MobileRangeSlider('my_slider'); // passing an ID
new MobileRangeSlider(element);     // passing a DOM element

````html
<input id="my_slider" type="range" min="1" max="100">
````

### Advanced Usage
You can pass in additional defaults as follows:
```js
var slider = new MobileRangeSlider('slider', {
  min: -50,
  max: 50,
  value: 0,
  // Called when value of slider changes
  change: function(value){
    console.log(value);
  }
});

...

slider.setValue(25);
```

### Options

* `value` - initial value. Defaul: 0
* `min` - minimum value. Default: 0
* `max` - maximum value. Default: 100
* `change` - callback handler

------
Forked from: https://github.com/ubilabs/mobile-range-slider
