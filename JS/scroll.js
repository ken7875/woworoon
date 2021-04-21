// recommand scroll
document.addEventListener('DOMContentLoaded', function() {
    const slideWrap = document.querySelector('.slideWrap');
    slideWrap.style.cursor = 'grab';
    let pos = {
        top: 0,
        left: 0,
        x: 0,
        y: 0
    }

    function mouseDownHandler(e) {
        slideWrap.style.cursor = 'grabbing';
        slideWrap.style.userSelect = 'none'

        pos = {
            left: slideWrap.scrollLeft,
            top: slideWrap.scrollTop,
            x: e.clientX,
            y: e.clientY
        }
        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('mouseup', mouseUpHandler)
    }

    function mouseMoveHandler(e) {
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y
        slideWrap.scrollLeft = pos.left - dx
        slideWrap.scrollTop = pos.top - dy
    }
    
    function mouseUpHandler() {
        slideWrap.style.cursor = 'grab';
        slideWrap.style.removeProperty('user-select')
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
    }
    slideWrap.addEventListener('mousedown', mouseDownHandler)
})