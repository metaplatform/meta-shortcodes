#meta-shortcodes

Generic shortcodes parser with support of attributes and single/pair tags.

## Usage
```javascript
var should = require("should");
var ShortcodeParser = require("meta-shortcodes");

var parser = ShortcodeParser();

parser.add("test", function(opts, content){
	return content.toUpperCase();
});

parser.add("nested", function(opts, content){
	
	if(!opts.multiply) return "Missing multiply attribute!";

	var out = [];

	for(var i = 0; i < opts.length; i++)
		out.push(opts[i] * parseFloat(opts.multiply));

	return out.join(" ");

});

var input = "Sample [test]shortcode content [nested multiply=2 2 4/] is upper[/test] case!";
var output = parser.parse(input);

output.should.eql("Sample SHORTCODE CONTENT 4 8 IS UPPER case!");
```

## Instalation
```
npm install meta-shortcodes
```

## API

### #constructor(opts)

```
opts = {
	openPattern: '\\[',
	closePattern: '\\]'
}
```

### #add(shortcodeName, handlerFunction)

Registers new shortcode

| Param           | Type     | Description                                                                                                     |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| shortcodeName   | string   | Name of shortcode tag                                                                                           |
| handlerFunction | function | Function that returns replacement for shortcode. Accepts two arguments - `options` object and `content` string. |

### #parse(inputStr)

Registers new shortcode

| Param    | Type   | Description                                       |
| -------- | ------ | ------------------------------------------------- |
| inputStr | string | Input string where shortcodes should be replaced. |

## Shortcode examples

```
#Self-closing
[name argument1 argument2 key=value key=value/]

#Pair
[name]content[/name]

#Quoted arguments
[name "argument 1" 'argument 2' "key is"="long value"/]

#Escaping quotes in arguments
[name "argu\"ment" "ke\"y"='val\'ue']

#Escaping of entire shortcode
\\[this shortcode is not processed /]
```

## Testing
```
npm install --dev
npm test
```

**Current code-coverage 97%**

## Using alternative brackets
```javascript
var should = require("should");
var ShortcodeParser = require("meta-shortcodes");

var parser = ShortcodeParser({
	openPattern: '\\{{',
	closePattern: '\\}}'
});

parser.add("test", function(opts, content){
	return content.toUpperCase();
});

var output = parser.parse("Sample {{test}}upper{{/test}} case!").should.eql("Sample UPPER case!");
```

## License

MIT (c) 2015 [META Platform team](http://www.meta-platform.com), [Jiri Hybek](http://jiri.hybek.cz/)