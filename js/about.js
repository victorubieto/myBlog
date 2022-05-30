
function swapImg(img) {
    let len = img.src.length;
    let idx = Number(img.src[len - 5]); // .jpeg = 5
    let newIdx = idx + 1 > 3 ? 1 : idx + 1 ;
    img.src = "/img/me" + newIdx + ".jpg";
}