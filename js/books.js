'use strict';

var bookMaxId = 0;

/* APP */

function init() {
	return new Promise(function(resolve, reject) {

		if (!window.localStorage) {
			reject(new Error('Browser doesn\'t support localStorage'));
		}

		// filter records from localStorage that belong to our app
		var books = [];
		for (var i = 0; i < localStorage.length; i++) {
			if (localStorage.key(i).includes(config.localStorage.prefix)) { 
				
				// find current items id
				var ind = localStorage.key(i).lastIndexOf('item-');
				var id = parseInt(localStorage.key(i).substr(ind+5));
				if (id > bookMaxId) {
					bookMaxId = id;
				}

				// parse current data
				var value = localStorage.getItem(localStorage.key(i));
				var data = value.split(config.localStorage.separator);

				books.push({
					key: localStorage.key(i),
					id: id,
					author: data[0],
					title: data[1],
					datePublish: data[2],
					pageCount: data[3]
				});
			}
		}

		// populate book list with items
		for (let i = 0; i < books.length; i++) {
			var elem = $(`
				<li id="book-${books[i].id}" class="clearfix">
					<ul class="actions clearfix">
						<li class="icon i-edit"></li>
						<li class="icon i-delete"></li>
					</ul>
					<div class="full-title">
						${books[i].author} - ${books[i].title} 
					</div>
				</li>	
			`);

			$(elem).find('.i-edit').on('click', function() {
				bookLoad(books[i].id);
			});
			$(elem).find('.i-delete').on('click', function() {
				if (confirm(`Вы действительно хотите удалить книгу '${books[i].author} - ${books[i].title}'?`)) {
					bookDelete(books[i].id);	
				}
			});

			$('.book-list').append(elem);
		}

		// init ui
		$('#book-add').show();
		$('#book-edit').hide();
		$('#switch-mode').hide();
		$('#date-publish').datepicker();

		resolve();
	});
}

/* CONSTROLS */

function bookAdd() {
	bookMaxId++;
	const author = $('#author').val().trim();
	const title = $('#title').val().trim();
	const datePublish = $('#date-publish').val().trim();
	const pageCount = $('#page-count').val().trim();

	const value = 	author + config.localStorage.separator +
					title + config.localStorage.separator + 
					datePublish + config.localStorage.separator +
					pageCount;
	
	localStorage.setItem(`${config.localStorage.prefix} item-${bookMaxId}`, value);

	var elem = $(`
		<li id="book-${bookMaxId}" class="clearfix">
			<ul class="actions clearfix">
				<li class="icon i-edit"></li>
				<li class="icon i-delete"></li>
			</ul>
			<div class="full-title">
				${author} - ${title} 
			</div>
		</li>	
	`);

	var id = bookMaxId;
	$(elem).find('.i-edit').on('click', function() {
		bookLoad(id);
	});
	$(elem).find('.i-delete').on('click', function() {
		if (confirm(`Вы действительно хотите удалить книгу '${author} - ${title}'?`)) {
			bookDelete(id);	
		}
	});
	$('.book-list').append(elem);

	alert(`Книга успешно добавлена`);
}

function bookEdit() {
	const id = $('.col-form').attr('current-book-id');
	const author = $('#author').val().trim();
	const title = $('#title').val().trim();
	const datePublish = $('#date-publish').val().trim();
	const pageCount = $('#page-count').val().trim();

	const value = 	author + config.localStorage.separator +
					title + config.localStorage.separator + 
					datePublish + config.localStorage.separator +
					pageCount;

	localStorage.setItem(`${config.localStorage.prefix} item-${id}`, value);

	$(`#book-${id} .full-title`).html(`${author} - ${title}`);

	alert(`Книга успешно обновлена`);
}

function bookLoad(bookId) {
	const item = localStorage.getItem(config.localStorage.prefix+' item-'+bookId);
	const data = item.split(config.localStorage.separator);

	$('#author').val(data[0]);
	$('#title').val(data[1]);
	$('#date-publish').val(data[2]);
	$('#page-count').val(data[3]);
	$('.col-form').attr('current-book-id', bookId);

	// hide show appripriate buttons
	$('#book-add').hide();
	$('#book-edit').show();
	$('#switch-mode').show();

	// switch 'current' element
	$('.book-list .current').removeClass('current');
	$('#book-'+bookId).addClass('current');
}

function bookDelete(bookId) {
	localStorage.removeItem(`${config.localStorage.prefix} item-${bookId}`);
	$(`#book-${bookId}`).remove();

	$('#author').val('');
	$('#title').val('');
	$('#date-publish').val('');
	$('#page-count').val('');

	$('#book-add').show();
	$('#book-edit').hide();
	$('#switch-mode').hide();

	alert(`Книга успешно удалена`);
}

function switchMode() {
	$('#author').val('');
	$('#title').val('');
	$('#date-publish').val('');
	$('#page-count').val('');

	$('#book-add').show();
	$('#book-edit').hide();
	$('#switch-mode').hide();

	// switch 'current' element
	$('.book-list .current').removeClass('current');
}

/* LOADING */

function loadingShow() {
	var loading = $('.loading');
	var body = $('body');
	var container = $('.container');
	
	loading.css('left', (body.width() - loading.width()) / 2 + 'px');
	loading.css('top', (body.height() - loading.height()) / 2 + 'px');
	loading.show();

	container.hide();
}

function loadingHide() {
	$('.loading').hide();
	$('.container').show();
}

/* FORM */

function validateForm() {
	var author = $('#author');
	if (author.val().length > 50) {
		author.focus();
		alert('Длина поля "Автор" превышает допустимый размер');
		return false;
	}
	if (author.val() === '' || author.val() === ' ') {
		author.focus();
		alert('Поле "Автор" не может быть пустым');
		return false;
	}

	var title = $('#title');
	if (title.val().length > 250) {
		title.focus();
		alert('Длина поля "Название книги" превышает допустимый размер');
		return false;
	}

	var datePublish = $('#date-publish');
	if (!datePublish.val().trim().match(/^\d{2}\.\d{2}\.\d{4}$/)) {
		datePublish.focus();
		alert('Дата должна иметь формат дд.мм.гггг');
		return false;
	}

	var pageCount = $('#page-count');
	if (!pageCount.val().trim().match(/^\d+$/)) {
		pageCount.focus();
		alert('Значение поле "Количество страниц" должно быть числом');
		return false;
	}	
	return true;
}

$(document).ready(function() {
	
	loadingShow(); // show loading indicator
	
	init().then(function() {
		loadingHide();
		
		// attach form click handlers
		$('#book-add').on('click', function() {
			if (!validateForm()) {
				return;
			}
			bookAdd();
		});
		$('#book-edit').on('click', function() {
			if (!validateForm()) {
				return;
			}
			bookEdit();
		});
		$('#switch-mode').on('click', function() {
			switchMode();
		});

	}).catch(function(err) {
		console.log(err.message, err.stack);
		alert('В приложении произошла ошибка, пожалуйста обратитесь к разработчику');
	});
});