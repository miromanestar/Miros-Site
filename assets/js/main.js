$(document).ready(function () {
    //Do nothing
});

window.addEventListener('popstate', function (e) {
    if (window.location.pathname === '/') {
        loadContent(`home`, '', false);
    } else {
        loadContent(window.location.pathname.substr(1), '', false);
    }
});


//When the page is loaded/refreshed, direct to correct page.
function onFirstLoad() {
    if (sessionStorage.getItem('redirect404') !== null) {
        loadContent(sessionStorage.getItem('redirect404').substr(1));
        sessionStorage.removeItem('redirect404');
    } else {
        loadContent('home');
    }
}

function loadContent(selection, state, changeState) {
    $('#page-content').hide().load(`pages/${ selection }`, function (response, status) { 
        if (status === 'error') {
            loadContent('404'); //Possible infinite loop?
        }
        $('#page-content').fadeIn('normal');
    });

    loadPartials(); //Check for partials every time the page is reloaded.
    
    if (typeof changeState === 'undefined' && changeState !== false) {
        if (selection === 'home') { //Instead of home having a /home.html url, display as base domain.
            if (window.location.pathname !== '/') {
                window.history.pushState(state, '', '/');
            }
        } else if (selection !== '404' && selection !== window.location.pathname.substr(1)) { //Maintain page url despite 404
            window.history.pushState(state, '', `/${selection}`);
        }
    }

    //Make header link active based on URL
    $('.nav-link').each(function (i) {
        if ($(this).html().toLowerCase() === location.pathname.split('/')[1]) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
}

function loadPartials() {
    $('[partial]').each(function (i) {
        $(this).load(`partials/${$(this).attr('partial')}`, function (response, status) {
            $(this).contents().unwrap();
            if (status === 'error') {
                $(this).html(`Error loading partial: ${$(this).attr('partial')}`);
            }
        });
    });
}