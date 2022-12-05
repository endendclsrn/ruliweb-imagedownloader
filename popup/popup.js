let url = "";
const check_all = document.querySelector("#check_all");
const check_preload = document.querySelector("#check_preload");
const check_video = document.querySelector("#check_video");
const imglist = document.querySelector("#imglist");
const down_btn = document.querySelector("#download");
const directory = document.querySelector("#dir");
const convention = document.querySelector("#convention");

let is_preload = true;
let include_video = true;
let always_all = true;


async function funcRequest(url) {
    await fetch(url, {
        headers: {
            "Content-Type": "text/html",
        },
    })
        .then((response) => {
            return response; // data into json
        })
        .then((data) => {
            // Here we can use the response Data
            console.log(data);
            data.text().then(function (text) {
                let vdom = document.createElement("div");
                vdom.innerHTML = text;
                let view_content = vdom.querySelector("#board_read .view_content");
                let img_list = view_content.querySelectorAll("img, video");
                let img_counter = 1;
                img_list.forEach(element => {
                    let change_url = element.src.replace("ruliweb.com/img/", "ruliweb.com/ori/");
                    change_url = change_url.replace("mp4?gif", "gif");
                    change_url = change_url.replace("mp4?webp", "webp");

                    let extension = change_url.substring(change_url.lastIndexOf(".") + 1);
                    let is_mp4 = false;
                    if (extension == "mp4") {
                        is_mp4 = true;
                        if (!include_video) {
                            return;
                        }
                    }

                    let content = document.createElement("div");
                    content.className = "item";
                    imglist.appendChild(content);

                    let checkbox = document.createElement("input");
                    checkbox.className = "item_check";
                    checkbox.id = "item_" + img_counter;
                    checkbox.type = "checkbox";
                    if (always_all) {
                        checkbox.checked = true;
                    }
                    checkbox.addEventListener("change", (e) => {
                        if (e.target.checked) {
                            let item_list = document.querySelectorAll("#imglist .item_check");
                            let check_list = document.querySelectorAll("#imglist .item_check:checked");
                            if (item_list.length == check_list.length) {
                                check_all.checked = true;
                            }
                        }
                        else {
                            check_all.checked = false;
                        }
                    });
                    content.appendChild(checkbox);

                    let img_area = document.createElement("label");
                    img_area.setAttribute("for", "item_" + img_counter++);
                    content.appendChild(img_area);

                    if (is_preload) {
                        if (is_mp4) {
                            let video = document.createElement("video");
                            video.src = change_url;
                            img_area.appendChild(video);
                        }
                        else {
                            let img = document.createElement("img");
                            img.src = change_url;
                            img_area.appendChild(img);
                        }
                    }
                    else {
                        let a = document.createElement("a");
                        a.href = change_url;
                        a.innerText = img_counter;
                        img_area.appendChild(a);
                    }
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

check_all.addEventListener("change", (e) => {
    let all = e.target.checked ? "1" : "0";
    chrome.storage.sync.set({ check_all: all }).then(() => {
        if (all == "1") {
            always_all = true;
            console.log("초기화 시 모든 아이템을 체크합니다.");
            let check_list = document.querySelectorAll("#imglist .item_check");
            check_list.forEach(element => {
                element.checked = true;
            });
        }
        else {
            always_all = false;
            console.log("초기화 시 모든 아이템을 체크하지 않습니다.");
            let check_list = document.querySelectorAll("#imglist .item_check:checked");
            check_list.forEach(element => {
                element.checked = false;
            });
        }
    });
});

down_btn.addEventListener("click", () => {
    const check_list = document.querySelectorAll("#imglist .item_check:checked");
    let counter = 1;
    const length = check_list.length;
    check_list.forEach(element => {
        let url = "";
        let img = element.parentElement.querySelector("img");
        let a = element.parentElement.querySelector("a");
        let video = element.parentElement.querySelector("video");
        if (img) {
            url = img.src;
        }
        else if (a) {
            url = a.href;
        }
        else if (video) {
            url = video.src;
        }
        let filename = "";
        if (convention.value == "") {
            filename = url.substring(url.lastIndexOf("/") + 1);
        }
        else {
            filename = convention.value;
            for (let i = String(counter).length; i < String(length).length; ++i) {
                filename += "0";
            }
            filename += String(counter);
        }
        let dir = directory.value;
        if (dir != "") {
            dir += "/";
        }
        chrome.downloads.download({
            url: url,
            filename: dir + filename,
        });
    });
});

check_preload.addEventListener("change", (e) => {
    let preload = e.target.checked ? "1" : "0";
    chrome.storage.sync.set({ preload: preload }).then(() => {
        let check_list = document.querySelectorAll("#imglist .item_check");
        if (preload == "1") {
            is_preload = true;
            console.log("이미지를 로드합니다.");
            check_list.forEach(element => {
                let a = element.parentNode.querySelector("a");
                if (a) {
                    let extension = a.href.substring(a.href.lastIndexOf(".") + 1);
                    if (extension == "mp4") {
                        let img = document.createElement("video");
                        img.src = a.href;
                        let parnet = element.parentNode.querySelector("label");
                        parnet.appendChild(img);
                        parnet.removeChild(a);
                    }
                    else {
                        let img = document.createElement("img");
                        img.src = a.href;
                        let parnet = element.parentNode.querySelector("label");
                        parnet.appendChild(img);
                        parnet.removeChild(a);
                    }
                }
            });
        }
        else {
            is_preload = false;
            console.log("이미지를 로드하지 않습니다.");
            check_list.forEach(element => {
                let img = element.parentNode.querySelector("img");
                let video = element.parentNode.querySelector("video");
                if (img) {
                    let a = document.createElement("a");
                    a.href = img.src;
                    let parnet = element.parentNode.querySelector("label");
                    parnet.appendChild(a);
                    parnet.removeChild(img);
                }
                else if (video) {
                    let a = document.createElement("a");
                    a.href = video.src;
                    let parnet = element.parentNode.querySelector("label");
                    parnet.appendChild(a);
                    parnet.removeChild(video);
                }
            });
        }
    });
});

check_video.addEventListener("change", (e) => {
    let video = e.target.checked ? "1" : "0";
    chrome.storage.sync.set({ include_video: video }).then(() => {
        let check_list = document.querySelectorAll("#imglist .item_check");
        if (video == "1") {
            include_video = true;
            console.log("비디오를 포함합니다.");
            check_list.forEach(element => {
            });
        }
        else {
            include_video = false;
            console.log("비디오를 포함하지 않습니다.");
            check_list.forEach(element => {
            });
        }
    });
});

directory.addEventListener("change", (e) => {
    let dir = e.target.value;
    chrome.storage.sync.set({ directory: dir }).then(() => {
        console.log(`저장 경로 : ${dir}`);
    });
});

convention.addEventListener("change", (e) => {
    let cvt = e.target.value;
    chrome.storage.sync.set({ convention: cvt }).then(() => {
        console.log(`파일명 규칙 : ${cvt}`);
    });
});


window.onload = () => {
    chrome.storage.sync.get("preload").then((result) => {
        console.log("사용자 값 [preload] : ", result.preload);
        if (result.preload == "0") {
            is_preload = false;
        }
        else {
            is_preload = true;
            check_preload.checked = true;
        }
    });

    chrome.storage.sync.get("directory").then((result) => {
        console.log("사용자 값 [directory] : ", result.directory);
        if (result.directory != undefined) {
            directory.value = result.directory;
        }
    });

    chrome.storage.sync.get("convention").then((result) => {
        console.log("사용자 값 [convention] : ", result.convention);
        if (result.convention != undefined) {
            convention.value = result.convention;
        }
    });

    chrome.storage.sync.get("include_video").then((result) => {
        console.log("사용자 값 [include_video] : ", result.include_video);
        if (result.include_video == "0") {
            include_video = false;
        }
        else {
            include_video = true;
            check_video.checked = true;
        }
    });

    chrome.storage.sync.get("check_all").then((result) => {
        console.log("사용자 값 [check_all] : ", result.check_all);
        if (result.check_all == "0") {
            always_all = false;
        }
        else {
            always_all = true;
            check_all.checked = true;
        }
    });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { from: 'popup', type: 'url', value: '0' },
            function (response) {
                url = response.msg.value;
                funcRequest(url);
            }
        );
    });
};

