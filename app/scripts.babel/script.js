import $ from 'jquery';

const IT_WORD_URL = 'http://e-words.jp/w/';
const GOOGLE_SEARCH_URL = 'https://www.google.co.jp/search?q=';
const GOOGLE_RESULT_NUM = 8;
const ARTICLE_HIGHT = 23;
const ARTICLE_MAX_WIDTH = 65;

let mX = 0;
let mY = 0;
let adjX = 15;
let adjY = -35;
let it_search;
let it_search_icon;
let result;
let title;
let content;
let select_text;
let tmp_text;
let _url;

$(function() {
	init();
	document.addEventListener("selectionchange", function(e) {
		select_text = window.getSelection().toString();
		select_text = $.trim(select_text);
		if (!select_text)
		{
			result.hide();
			return false;
		}
		tmp_text = select_text;
		it_search.show();
		it_search.css({
			'position':'absolute',
			'left': (mX + adjX) + 'px',
			'top': (mY + adjY) + 'px',
		});
		result.css({
			'position':'absolute',
			'left': mX + 'px',
			'top': mY + 'px',
		});
	}, false);
});

function init()
{
	var body = $('body');
	body.mousemove(function(e){
		mX = e.pageX;
		mY = e.pageY;
	});
	var html =
	'<div id="it-search">' +
	'<div class="it-search-icon"></div>' +
	'</div>' +
	'<div id="it-search-result">' +
	'<div id="it-search-title"></div>' +
	'<div id="it-search-content"></div>' +
	'</div>';
	$('body').append(html);

	it_search = $('#it-search');
	it_search_icon = $('.it-search-icon');
	result = $('#it-search-result');
	title = $('#it-search-title');
	content = $('#it-search-content');

	body.click(function(){
		if (!select_text)
		{
			it_search.hide();
		}
	})
	it_search_icon.css({
		'background-image': 'url("' + chrome.extension.getURL("images/icon_16.png") + '")'
	});
	it_search_icon.click(function(){
		search();
		it_search.hide();
	});
	it_search.hide();
	result.hide();
}

function search()
{
	_url = IT_WORD_URL + tmp_text + '.html'
	$.ajax({
		url: _url,
		type: 'GET',
		statusCode:{
				404:function() {
					$.ajax({
						url: GOOGLE_SEARCH_URL + tmp_text,
						type: 'GET',
					}).done(function(data){
						disp_list(data);
					});
				}
			}
	}).fail(function() {
		empty();
	}).done(function(data){
		disp(data);
	});
}

function disp_list(data)
{
	result.show();
	var total_hight = ARTICLE_HIGHT * GOOGLE_RESULT_NUM;
	var out_html = $($.parseHTML(data));
	var srg = out_html.find('.srg')[0];
	$(srg).find('.r').each(function(i, elem){
		if (i === GOOGLE_RESULT_NUM) {
			return false;
		}
		var a_tag = $(elem).children('a');
		var url = $(a_tag).attr('href');
		title.append('<li class="it-search-li"><a href="' + url + '" target="_blank">'+ a_tag.text() + '</a></li>');
		if (bytes(a_tag.text()) >= ARTICLE_MAX_WIDTH)
		{
			total_hight += ARTICLE_HIGHT;
		}
	});
	resize(total_hight, 500);
}

function disp(data)
{
	result.show();
	var out_html = $($.parseHTML(data));
	title.empty().append(out_html.find('#h1word')[0].innerHTML);

	var sums = out_html.find('#Summary');
	if (sums.length > 0)
	{
		var sum = sums[0];
		$(sum).children('p').children('a').each(function(){
			var url = IT_WORD_URL + $(this).attr('href');
			$(this).attr('href', url);
			$(this).attr('target', '_blank');
		});
		content.empty().append(sum.innerHTML);
		resize(300, 500);
	}
	else
	{
		var subheads = out_html.find('.subhead');
		if (subheads.length > 0)
		{
			content.empty();
			content.append('<ul>');
			$(subheads).each(function(){
				content.append('<li class="it-search-li">' + $($(this).children('a')[0]).html() + '</li>');
			});
			content.append('</ul>');
			resize(150, 400);
		}
		else
		{
			var p = out_html.find('#content > p:first')[0];
			content.empty().append(p.innerHTML);
			resize(400, 400);
		}
	}
	content.append('<div id="it-search-more"><a href=' + _url + ' target="_blank">詳しく</a></div>');
}

function empty()
{
	result.show();
	title.empty();
	content.empty();
}

function resize(hight, width)
{
	result.css({
		'height': hight + 'px',
		'width': width + 'px',
	});
}

function bytes(str){
    var len = 0;
    str = escape(str);
    for(var i = 0; i < str.length; i++, len++){
        if(str.charAt(i) == "%"){
            if(str.charAt(++i) == "u"){
                i += 3;
                len++;
            }
            i++;
        }
    }
    return len;
}
