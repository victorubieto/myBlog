// When the user scrolls the page, execute myFunction
window.addEventListener("scroll", function(e) {
    myFunction();
});

let header = document.getElementById("myHeader");
// Get the offset position of the navbar
let sticky = window.outerHeight * 4 / 100;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}
