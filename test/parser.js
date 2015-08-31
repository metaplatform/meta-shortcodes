/*
 * META Platform library
 * Shortcode parser - TEST
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var should = require("should");

var ShortcodeParser = require(__dirname + "/../lib/parser.js");

describe("ShortcodeParser", function(){

	describe("#constructor", function(){

		it("should construct with default options", function(){

			var parser = ShortcodeParser();

			parser.options.should.eql({
				openPattern: '\\[',
				closePattern: '\\]'
			});

		});

		it("should construct with specified options", function(){

			var parser = ShortcodeParser({
				openPattern: '\\{\\{',
				closePattern: '\\}\\}'
			});

			parser.options.should.eql({
				openPattern: '\\{\\{',
				closePattern: '\\}\\}'
			});

		});

	});

	describe("#add", function(){

		var parser = ShortcodeParser();

		it("should register shortcode", function(){

			var handler = function(){
				return;
			};

			parser.add("test", handler);

			parser.shortcodes.test.should.eql(handler);

		});

	});

	describe("#parse", function(){

		it("should parse non-shortcode string as it is", function(){

			var parser = ShortcodeParser();

			parser.parse("Some test should work.").should.eql("Some test should work.");

		});

		it("should parse basic self-closing shortcode", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return "OK";
			});

			parser.parse("Some [test/] should work.").should.eql("Some OK should work.");

		});

		it("should parse basic pair shortcode", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return content.toUpperCase();
			});

			parser.parse("Some [test]ok[/test] should work.").should.eql("Some OK should work.");

		});

		it("should parse single argument", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts[0];
			});

			parser.parse("Some [test OK/] should work.").should.eql("Some OK should work.");

		});

		it("should parse multiple arguments", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts.join("+");
			});

			parser.parse("Some [test A B/] should work.").should.eql("Some A+B should work.");

		});

		it("should parse single attribute", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts.a;
			});

			parser.parse("Some [test a=B/] should work.").should.eql("Some B should work.");

		});

		it("should parse multiple attributes", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts.a + "+" + opts.c;
			});

			parser.parse("Some [test a=B c=D/] should work.").should.eql("Some B+D should work.");

		});

		it("should parse both arguments and attributes mixed", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts.join("+") + "+" + opts.a + "+" + opts.x;
			});

			parser.parse("Some [test 1 2 3 a=B x=Y/] should work.").should.eql("Some 1+2+3+B+Y should work.");

		});

		it("should parse arguments in quotes with respect to escaping", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return opts.join("+") + "+" + opts["long=key"];
			});

			parser.parse("Some [test \"long attribute\" 'another escaped attribute' 'long=key'='evil\"value'/] should work.").should.eql("Some long attribute+another escaped attribute+evil\"value should work.");

		});

		it("should parse multiple shortcodes", function(){

			var parser = ShortcodeParser();

			parser.add("test1", function(opts, content){
				return "A";
			});

			parser.add("test2", function(opts, content){
				return "B";
			});

			parser.parse("Some [test1/] and [test2/] should work.").should.eql("Some A and B should work.");

		});

		it("should parse nested shortcodes", function(){

			var parser = ShortcodeParser();

			parser.add("test1", function(opts, content){
				return content.toUpperCase();
			});

			parser.add("test2", function(opts, content){
				return "b";
			});

			parser.parse("Some [test1]nested [test2/] should[/test1] work.").should.eql("Some NESTED B SHOULD work.");

		});

		it("should parse multiple nested shortcodes", function(){

			var parser = ShortcodeParser();

			parser.add("test1", function(opts, content){
				return content.toUpperCase();
			});

			parser.add("test2", function(opts, content){
				return "b";
			});

			parser.parse("Some [test1]nested [test1][test2/][/test1] [test2/] should[/test1] work.").should.eql("Some NESTED B B SHOULD work.");

		});

		it("should mark unknown shortcode", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [test1]pair with [test3/] nested[/test1] and [test2/] shortcode. [another sc").should.eql("Some [!test1!]pair with [!test3!/] nested[/!test1!] and [!test2!/] shortcode. [!another!/]");

		});

		it("should mark error if no tag name", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [.").should.eql("Some [^!].");

		});

		it("should mark error if unclosed tag body", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [test with unclosed attributes").should.eql("Some [!test!/]");

		});

		it("should mark error if unclosed pair tag", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [test]with content").should.eql("Some [!test!]with content");

		});

		it("should mark error if broken closing tag", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [test]with content[/test").should.eql("Some [!test!]with content[/test");

		});

		it("should mark error if different closing tag", function(){

			var parser = ShortcodeParser();

			parser.parse("Some [test]with content[/test2]").should.eql("Some [!test!]with content[/test2]");

		});

		it("should parse shortcode with alternative brackets", function(){

			var parser = ShortcodeParser({
				openPattern: '\\{{',
				closePattern: '\\}}'
			});

			parser.add("test", function(opts, content){
				return "OK";
			});

			parser.parse("Some {{test/}} should work.").should.eql("Some OK should work.");

		});

		it("should ignore shortcode with escaped opening pattern", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return "OK";
			});

			parser.parse("Some \\[test/] \\[test] [test /] \\[test] \\[test /] [/test] should be ignored.").should.eql("Some [test/] [test] OK [test] [test /] [/test] should be ignored.");

		});

		it("should ignore shortcode with escaped opening pattern nested in regular shortcode", function(){

			var parser = ShortcodeParser();

			parser.add("test", function(opts, content){
				return content.toUpperCase();
			});

			parser.parse("Some [test]nested \\[shortcode] or \\[shortcode /] or \\[shortcode]...[/shortcode][/test] should be ignored.").should.eql("Some NESTED [SHORTCODE] OR [SHORTCODE /] OR [SHORTCODE]...[/SHORTCODE] should be ignored.");

		});

	});

});