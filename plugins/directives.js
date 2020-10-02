import Vue from 'vue';

Vue.directive('image-drag', {

    bind: function(el, binding) {

        let elementPositionX = 0;
        let elementPositionY = 0;
        let mousePositionX = 0;
        let mousePositionY = 0;

        el.addEventListener('load', function () {
            if(binding.arg === 'center') {
                elementPositionX = -Math.abs(el.clientWidth / 2);
                elementPositionY = -250;

                el.style.transform = `translate(${elementPositionX}px, ${elementPositionY}px)`;
            }
        });

        function dragStart(e) {
            if (e.type === 'touchstart') {
                mousePositionX = e.touches[0].clientX - elementPositionX;
                mousePositionY = e.touches[0].clientY - elementPositionY;
            }
            else {
                mousePositionX = e.clientX - elementPositionX;
                mousePositionY = e.clientY - elementPositionY;
            }
        }

        // function dragEnd(e) {
        //     mousePositionX = elementPositionX;
        //     mousePositionY = elementPositionY;
        // }

        function drag(e) {
            e.preventDefault();

            const imageData = e.target.getBoundingClientRect();

            if (e.type === 'touchmove') {
                elementPositionX = e.touches[0].clientX - mousePositionX;
                elementPositionY = e.touches[0].clientY - mousePositionY;
            }
            else {
                elementPositionX = e.clientX - mousePositionX;
                elementPositionY = e.clientY - mousePositionY;
            }

            // y-axis positioning
            // The picture's Y position should never be above 0
            if(elementPositionY < 0) {
                if((imageData.height - window.innerHeight + elementPositionY) < 0) {
                    // trying to move up too far, so forcing back down to the max y position
                    elementPositionY = -Math.abs(imageData.height - window.innerHeight);
                }
            }
            else {
                elementPositionY = 0;
            }

            // x-axis positioning
            const minX = -Math.abs(imageData.width - window.innerWidth);
            if(elementPositionX < 0) {
                if(elementPositionX < minX) {
                    elementPositionX = minX;
                }
            }
            else {
                elementPositionX = 0;
            }

            el.style.transform = `translate(${elementPositionX}px, ${elementPositionY}px)`;
        }


        el.addEventListener('touchstart', dragStart, false);
        // el.addEventListener('touchend', dragEnd, false);
        el.addEventListener('touchmove', drag, false);

        el.addEventListener('mousedown', dragStart, false);
        // el.addEventListener('mouseup', dragEnd, false);
        el.addEventListener('mousemove', drag, false);
    }

});
