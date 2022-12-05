chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if ((msg.from === 'popup')) {
        switch (msg.type) {
            case 'url':
                response({
                    msg: {
                        from: 'contentscript',
                        type: 'url',
                        value: window.location.href
                    }
                });
                break;
            default:
                break;
        }
    }
});

function removeGetParameter() {
    // let url = window.location.href;
    // url = url.replace(/[?&]{1}([^=&#]+)=([^&#]*)/g, "");
    // window.location.href = url;
    history.replaceState({}, null, location.pathname);
}
removeGetParameter();

function openOriSource(element) {
    element.addEventListener("click", (e) => {
        e.preventDefault();

        let change_url = "";
        let url = element.src;
        if (element instanceof HTMLImageElement) {
            // change_url = url.replace("ruliweb.com/img/", "ruliweb.com/ori/");
        }
        else if (element instanceof HTMLVideoElement) {
            change_url = url.replace(".mp4?gif", ".gif");
            change_url = url.replace(".mp4?ani?gif", ".gif");
            change_url = change_url.replace("mp4?webp", "webp");
            change_url = change_url.replace("mp4?ani?webp", "webp");
        }
        // const fileName = change_url.split('/').pop();
        let anchor = document.createElement("a");
        anchor.setAttribute("target", "_blank");
        anchor.href = change_url;
        document.body.appendChild(anchor);
        anchor.click();
    });
}

window.onload = () => {
    // document.querySelectorAll(".comment_element .comment img").forEach(element => {
    //     openOriSource(element);
    // });
    // document.querySelectorAll(".comment_element .comment video").forEach(element => {
    //     openOriSource(element);
    // });
};
