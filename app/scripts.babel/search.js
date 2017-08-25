import $ from 'jquery';

const IT_WORD_URL = 'http://e-words.jp/w/';
const GOOGLE_SEARCH_URL = 'https://www.google.co.jp/search?q=';
const GOOGLE_RESULT_NUM = 8;
let _url = "";

$(function(){
	init();
});

function init() {
	$('.icon-search').click(function(){
		search();
	});

	$('.form-control').keypress(function(e) {
		if (e.which == 13) {
			search();
		}
	});
}

function search()
{
	var text = $.trim($('.form-control').val());
	if (!text) {
		return false;
	}
	_url = IT_WORD_URL + text + '.html'
	$.ajax({
		url: _url,
		type: 'GET',
		statusCode:{
				404:function() {
					$.ajax({
						url: GOOGLE_SEARCH_URL + text,
						type: 'GET',
					}).done(function(data){
						result(data);
					});
				}
			}
	}).fail(function() {
		empty();
	}).done(function(data){
		disp(data);
	});
}

function result(data)
{
	var out_html = $($.parseHTML(data));
	var srg = out_html.find('.srg')[0];
	var title = $('#title');
	$(srg).find('.r').each(function(i, elem){
		if (i === GOOGLE_RESULT_NUM) {
			return false;
		}
		var a_tag = $(elem).children('a');
		var url = $(a_tag).attr('href');
		title.append('<li><a href="' + url + '" target="_blank">'+ a_tag.text() + '</a></li>');
	});
}

function disp(data)
{
	var out_html = $($.parseHTML(data));
	$('#title').empty().append(out_html.find('#h1word')[0].innerHTML);

	var sums = out_html.find('#Summary');
	if (sums.length > 0)
	{
		var sum = sums[0];
		$(sum).children('p').children('a').each(function(){
			var url = IT_WORD_URL + $(this).attr('href');
			$(this).attr('href', url);
			$(this).attr('target', '_blank');
		});
		$('#content').empty().append(sum.innerHTML);
	}
	else
	{
		var subheads = out_html.find('.subhead');
		if (subheads.length > 0)
		{
			$('#content').empty();
			$('#content').append('<ul>');
			$(subheads).each(function(){
				$('#content').append('<li>' + $($(this).children('a')[0]).html() + '</li>');
			});
			$('#content').append('</ul>');
		}
		else
		{
			var p = out_html.find('#content > p:first')[0];
			$('#content').empty().append(p.innerHTML);
		}
	}
	$('#content').append('<div><a href=' + _url + ' target="_blank">詳しく</a></div>');
}

function empty()
{
	$('#title').empty().append('NOT FOUND');
	$('#content').empty();
}