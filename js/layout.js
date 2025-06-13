// globals
var ContentPos;

// document load
$(document).ready(function() {                
    // init controls
    $('#menu-about').click(function() {
        MenuClick(this);
    });
    $('#menu-personal_projects').click(function() {
        MenuClick(this);
    });
    $('#menu-shipped_games').click(function() {
        MenuClick(this);
    });
    $('#menu-game_jam_projects').click(function() {
        MenuClick(this);
    });
    $('#menu-resume').click(function() {
        MenuClick(this);
    });
    $('#menu-contact').click(function() {
        MenuClick(this);
    });
    
    $('#overlay_close').click(function() {
       CloseOverlay(); 
    });
    
    
    InitActiveMenuBorder($('#menu-personal_projects'));   
    
    // set original content pos (for restoring after fade-in/fade-out)
    ContentPos = $('#content').offset();    
        
    // read the page's hash fragment and load the relevant page
    var hash = window.location.hash;       
    OnHashChange(hash);    
    
    window.onpopstate = function(event) { 
        var hash = window.location.hash;     
        OnHashChange(hash); 
    };
    
});


// make sure the active menu border aligns properly after resizing the browser
$(window).resize(function() {
    InitActiveMenuBorder($('#menu .active'));    
});

var GlobalHashCustomSet = false;
function OnHashChange(hash)
{
    if(!GlobalHashCustomSet)
    {
        hash = hash.replace('#', '');
        LoadContent(hash, false, 0, true);
        // alert(hash);
        
        var prevActive = $('#menu .active');    
        var prevIndex = prevActive.attr('index');       
        $('#active-border').css('left', $('#menu-' + hash).offset().left);
        $('#active-border').css('width', $('#menu-' + hash).width());
        prevActive.attr('class', '');            
        $('#menu-' + hash).attr('class', 'active');
    }
}

// initializers
function InitActiveMenuBorder(element)
{
    element.attr('class', 'active');
    var height = $('#active-border').height();
    $('#active-border').css('left', element.offset().left);
    $('#active-border').css('top', element.offset().top + element.height());
    
    // re-calculate original content pos after resize
    ContentPos = $('#content').offset();
};

function LoadContent(content, animate, toRight, hash)
{
    // set hash fragment at top of URL (for bookmarks)
    if(content == '') content = 'about';

    if(hash)
    {
        GlobalHashCustomSet = true;
        location.hash = '#' + content;
        GlobalHashCustomSet = false;

        document.title = 'Ankit S. Kushwah';
    }
     
    // retrieve content    
    var content_file = content.replace('..', '') + '.html';  
    console.log("content file contains " + content_file);   
       
    if(animate)
    {
        if(!$('#content').is(':animated'))
        {
            // get margins for restore after fade
            var marginLeft = parseInt($('#content').css('margin-left').replace('px', ''));
            var marginTop = parseInt($('#content').css('margin-top').replace('px', ''));

            var currentLeft = ContentPos.left - marginLeft;
            // calculate offset
            var offset = toRight ? -75 : 75;
            
            // animate
            $('#content').offset(ContentPos);
            $('#content').css('position', 'absolute');
            $('#content').css('left', ContentPos.left - marginLeft);
            $('#content').css('top', ContentPos.top - marginTop);
            $('#content').animate({
               opacity: 0,
               left: ContentPos.left - marginLeft + offset
            }, { duration: 300, queue: false, complete: function() {    
                $.get('content/' + content_file, function(data) {
                    // once loaded, fade new content back in
                    var precontent = '';
                    if(!hash)
                    {
                        precontent = "<div class=\"portfolio_back\" onclick=\"LoadContent('portfolio', true, true, true)\"></div>" 
                    }
                    $('#content').html(precontent + data);                 
                    $('#content').css('left', currentLeft - offset);      
                    window.scrollTo(0, 0);                
                    $('#content').animate({
                        opacity: 1,
                        left: ContentPos.left - marginLeft
                    }, { duration: 300, queue: false, complete: function() {
                        $('#content').css('position', 'relative');
                        $('#content').offset(ContentPos);
                    }});
                });        
            }});
        }
    }
    else
    {
        $.get('content/' + content_file, function(data) {
            $('#content').html(data); 
        });
    }
}

function MenuClick(sender, force)
{
    force = typeof(force) != 'undefined' ? force : false;
    
    var prevActive = $('#menu .active');    
    var prevIndex = prevActive.attr('index');
    
    // check if previous element is still animating, if so; prevent menu switch
    if(!$('#active-border').is(':animated'))
    {    
        var index = $(sender).attr('index');
        if(force || index != prevIndex)
        {    
            var difference = index - prevIndex;
            
            // smoothly fade out previous active menu item                         
            $('#active-border').animate({
                left: $(sender).offset().left,
                width: $(sender).width()
            }, { duration: 650, queue: false, complete: function() {
                
            }});         
            
            prevActive.attr('class', '');            
            $(sender).attr('class', 'active');
    
            // then retrieve content
            var toRight = difference > 0; // note: difference of 0 should not be possible
            LoadContent($(sender).attr('id').replace('menu-', ''), true, toRight, true);             
        }    
    }

     // Get all elements with class="collapsible" and add an event listener
     document.querySelectorAll('.collapsible').forEach(item => {
        item.addEventListener('click', function() {
            // Toggle the display of the content
            const content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
};

//support for touch

(function() {
    let touchStartX = null;
    const swipeThreshold = 60;

    // Attach to a scroll-safe, visible area (not whole document)
    const swipeTarget = document.getElementById('content') || document.body;

    swipeTarget.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    swipeTarget.addEventListener('touchend', function(e) {
        if (touchStartX === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const dx = touchEndX - touchStartX;
        touchStartX = null;

        if (Math.abs(dx) < swipeThreshold) return;

        const direction = dx < 0 ? 1 : -1;  // swipe left = +1
        handleSwipe(direction);
    }, { passive: true });

    function handleSwipe(direction) {
        const items = Array.from(document.querySelectorAll('#menu > div'));
        const current = document.querySelector('#menu .active');

        if (!current) return;

        const currentIndex = parseInt(current.getAttribute('index'));
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= items.length) return;

        const nextItem = items[nextIndex];
        if (typeof MenuClick === 'function') {
            MenuClick(nextItem, true);
        } else if (typeof window.MenuClick === 'function') {
            window.MenuClick(nextItem, true);
        }
    }
})();
