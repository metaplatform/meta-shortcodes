/*
 * META Platform library
 * Shortcode parser
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

/**
 * Tokenizer constructor
 */
var Tokenizer = function(source){

	this.source = source;
	this.output = '';
	this.buffer = '';

	this.cursor = 0;

	this.parser = null;
	this.context = [];

};

/**
 * Move cursor by offset
 *
 * @param int offset
 */
Tokenizer.prototype.skip = function(offset){

	this.cursor+= offset;

};

/**
 * Returns next character
 *
 * @param bool toBuffer
 * @param bool skipEscape
 * @param bool skip
 * @return string|false
 */
Tokenizer.prototype.next = function(toBuffer, skip){

	if(skip === undefined) skip = true;

	var c = this.source.substr(this.cursor, 1);

	if(toBuffer)
		this.toBuffer(c);

	if(skip)
		this.skip(1);

	return c;

};

/**
 * Adds specified character count to buffer and skip
 *
 * @param int offset
 * @return string|false
 */
Tokenizer.prototype.eat = function(offset){

	var str = this.source.substr(this.cursor, offset);

	this.toBuffer(str);
	this.skip(offset);

	return str;

};

/**
 * Match string in source
 *
 * @param string pattern
 * @param bool prevToBuffer
 * @param bool tokenToBuffer
 * @param bool skip
 * @param bool ignoreEscape
 * @return string|false
 */
Tokenizer.prototype.match = function(pattern, prevToBuffer, tokenToBuffer, skip, ignoreEscape){

	if(skip === undefined) skip = true;

	var str = this.source.substr(this.cursor);
	var rx = new RegExp(pattern);

	var match = rx.exec(str);

	if(match === null)
		return false;

	if(!ignoreEscape && this.source.substr(this.cursor + match.index - 1, 1) == "\\"){

		if(prevToBuffer){
			this.buffer+= this.source.substr(this.cursor, match.index - 1);
			this.buffer+= this.source.substr(this.cursor + match.index, match[0].length);
		}

		this.skip(match.index);
		this.skip(match[0].length);

		return this.match(pattern, prevToBuffer, tokenToBuffer, skip, ignoreEscape);

	}

	if(prevToBuffer)
		this.buffer+= this.source.substr(this.cursor, match.index);

	if(tokenToBuffer)
		this.buffer+= match[0];

	if(skip){
		this.skip(match.index);
		this.skip(match[0].length);
	}

	return match[0];

};

/**
 * Returns buffer contents
 *
 * @return string
 */
Tokenizer.prototype.getBuffer = function(){

	return this.buffer;

};

/**
 * Add string to buffer
 *
 * @param string str
 */
Tokenizer.prototype.toBuffer = function(str){

	this.buffer+= str;

};

/**
 * Flush buffer to output and reset buffer
 */
Tokenizer.prototype.flushBuffer = function(){

	this.output+= this.buffer;
	this.buffer = '';

};

/**
 * Set buffer to empty string and return it previous contents
 *
 * @return string
 */
Tokenizer.prototype.clearBuffer = function(){

	var b = this.buffer;

	this.buffer = '';

	return b;

};

/**
 * Flush remaining contents to output buffer
 */
Tokenizer.prototype.flushRest = function(skip){

	if(skip === undefined) skip = true;

	this.output+= this.source.substr(this.cursor);

	if(skip)
		this.skip(this.source.length - this.cursor);

};

/**
 * Returns output contents
 *
 * @return string
 */
Tokenizer.prototype.getOutput = function(){

	return this.output;

};

/**
 * Add string to output
 *
 * @param string str
 */
Tokenizer.prototype.toOutput = function(str){
	
	this.output+= str;

};

/**
 * Return cursor
 *
 * @return int
 */
Tokenizer.prototype.getCursor = function(){
	
	return this.cursor;

};

/**
 * Return if cursor is at end
 *
 * @return bool
 */
Tokenizer.prototype.isEnd = function(){
	
	return (this.cursor >= this.source.length ? true : false);

};

/**
 * Open new nested context
 *
 * @param Object ctx
 */
Tokenizer.prototype.openContext = function(ctx){

	this.context.push(ctx);

};

/**
 * Close last context and return it
 *
 * @return Object
 */
Tokenizer.prototype.closeContext = function(){

	return this.context.pop();

};

/**
 * Return current (last) context
 *
 * @return Object
 */
Tokenizer.prototype.getContext = function(){

	return this.context[this.context.length - 1] || null;

};

/**
 * Start parsing using specified parser
 *
 * @param Function parser
 * @param Object thisObj
 */
Tokenizer.prototype.tokenize = function(parser, thisObj){

	var thisCtx = thisObj || this;

	this.parser = parser;

	while(this.parser){

		this.parser = this.parser.call(thisCtx, this, this.getContext());

	}

};

//Export
module.exports = function(source){
	return new Tokenizer(source);
};