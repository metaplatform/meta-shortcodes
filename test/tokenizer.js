/*
 * META Platform library
 * Shortcode parser - TEST
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var should = require("should");

var Tokenizer = require(__dirname + "/../lib/tokenizer.js");

describe("Tokenizer", function(){

	describe("#constructor", function(){

		it("should construct with source", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.source.should.eql("hello world!");
			tokenizer.output.should.eql('');
			tokenizer.buffer.should.eql('');
			tokenizer.cursor.should.eql(0);

		});

	});

	describe("#skip", function(){

		it("should move cursor", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(2);
			tokenizer.skip(3);
			tokenizer.cursor.should.eql(5);

		});

	});

	describe("#next", function(){

		it("should return character at current cursor", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(2);
			tokenizer.next().should.eql("l");

		});

		it("should move cursor by default", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(2);
			tokenizer.next();
			tokenizer.cursor.should.eql(3);

		});

		it("should add to buffer if specified", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(2);
			tokenizer.next(true);
			tokenizer.buffer.should.eql("l");

		});

		it("should not skip if specified", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(2);
			tokenizer.next(false, false);
			tokenizer.cursor.should.eql(2);

		});

	});

	describe("#eat", function(){

		it("should return specified number of characters", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.eat(2).should.eql("he");

		});

		it("should move cursor by count of eated characters", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.eat(2);
			tokenizer.cursor.should.eql(2);

		});

		it("should add eated characters to buffer", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.eat(2);
			tokenizer.buffer.should.eql("he");

		});

	});

	describe("#match", function(){

		it("should return false when no match and should not skip", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			var m = tokenizer.match("none");

			m.should.eql(false);
			tokenizer.cursor.should.eql(0);

		});

		it("should return matched string if match", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			var m = tokenizer.match("everybody");

			m.should.eql("everybody");
			

		});

		it("should move cursor if match by default", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			tokenizer.match("everybody");
			tokenizer.cursor.should.eql(15);
			
		});

		it("should add previous content to buffer if match", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			tokenizer.match("everybody", true);
			tokenizer.buffer.should.eql("hello ");
			
		});

		it("should add token to buffer if match", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			tokenizer.match("everybody", false, true);
			tokenizer.buffer.should.eql("everybody");
			
		});

		it("should not skip if match and specified to not skip", function(){

			var tokenizer = Tokenizer("hello everybody in the world!");

			tokenizer.match("everybody", false, false, false);
			tokenizer.cursor.should.eql(0);
			
		});

	});

	describe("#toBuffer", function(){

		it("should add string to buffer", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.buffer.should.eql("test");

		});

	});

	describe("#flushBuffer", function(){

		it("should flush buffer to output", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.flushBuffer();

			tokenizer.output.should.eql("test");

		});

		it("should reset buffer", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.flushBuffer();

			tokenizer.buffer.should.eql("");

		});

	});

	describe("#clearBuffer", function(){

		it("should set buffer to empty string", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.clearBuffer();
			tokenizer.buffer.should.eql("");

		});

		it("should return previous buffer contents", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.clearBuffer().should.eql("test");

		});

	});

	describe("#getBuffer", function(){

		it("should return buffer contents", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toBuffer("test");
			tokenizer.getBuffer().should.eql("test");

		});

	});

	describe("#flushRest", function(){

		it("should flush remaining source content to output", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(6);
			tokenizer.flushRest();

			tokenizer.output.should.eql("world!");

		});

		it("should skip by default", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.flushRest();
			tokenizer.cursor.should.eql(12);

		});

	});

	describe("#toOutput", function(){

		it("should add string to output", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toOutput("test");
			tokenizer.output.should.eql("test");

		});

	});

	describe("#getOutput", function(){

		it("should return output contents", function(){

			var tokenizer = Tokenizer("");

			tokenizer.toOutput("test");
			tokenizer.getOutput().should.eql("test");

		});

	});

	describe("#getCursor", function(){

		it("should return cursor value", function(){

			var tokenizer = Tokenizer("hello world!");

			tokenizer.skip(5);
			tokenizer.getCursor().should.eql(5);

		});

	});

	describe("#isEnd", function(){

		it("should return false when not at end", function(){

			var tokenizer = Tokenizer("hello");

			tokenizer.skip(3);
			tokenizer.isEnd().should.eql(false);

		});

		it("should return true when at end", function(){

			var tokenizer = Tokenizer("hello");

			tokenizer.skip(5);
			tokenizer.isEnd().should.eql(true);

		});

	});

	describe("#openContext", function(){

		it("should add new context", function(){

			var tokenizer = Tokenizer("");

			var ctx = {
				a: "b"
			};

			tokenizer.openContext(ctx);
			tokenizer.context.should.has.lengthOf(1);
			tokenizer.context[0].should.eql(ctx);

		});

	});

	describe("#closeContext", function(){

		it("should close context and return it", function(){

			var tokenizer = Tokenizer("");

			var ctx = {
				a: "b"
			};

			tokenizer.openContext(ctx);
			tokenizer.context.should.has.lengthOf(1);
			
			tokenizer.closeContext().should.eql(ctx);
			tokenizer.context.should.has.lengthOf(0);

		});

	});

	describe("#getContext", function(){

		it("should return last context", function(){

			var tokenizer = Tokenizer("");

			var ctx1 = {
				a: "b"
			};

			var ctx2 = {
				a: "b"
			};

			tokenizer.openContext(ctx1);
			tokenizer.openContext(ctx2);
			
			tokenizer.getContext().should.eql(ctx2);

		});

	});

	describe("#tokenize", function(){

		it("should run tokenizer 3 times", function(){

			var tokenizer = Tokenizer("");

			tokenizer.openContext({
				index: 0
			});

			var parser = function(t, ctx){

				ctx.index++;

				while(ctx.index < 3)
					return parser;

				return false;

			};

			tokenizer.tokenize(parser);

			tokenizer.closeContext().should.eql({
				index: 3
			});

		});

	});

});