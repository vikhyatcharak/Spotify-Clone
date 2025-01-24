let currSong = new Audio();
let currFolder = "og playlist";
let songs = [];

const token = "Spotify Clone API Token"; // Replace with your GitHub token

// Add Authorization header to your fetch requests
const fetchWithAuth = async (url) => {
    let response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
        },
    });
    return response;
};

async function getFolders() {
    try {
        let response = await fetchWithAuth(`https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText} (Status code: ${response.status})`);
        }

        let data = await response.json();
        let folderSection = document.querySelector(".container .right .section .cardContainer");

        for (let folderData of data) {
            if (folderData.type === 'dir') {
                let folderName = folderData.name;
                let getInfo = await fetchWithAuth(`https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${folderName}/info.json`);

                if (!getInfo.ok) {
                    throw new Error(`Failed to fetch info.json for folder ${folderName}`);
                }

                let r = await getInfo.json();

                folderSection.innerHTML += `
                    <div class="card">
                        <button class="green-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <img src="https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${folderName}/cover.jpg" alt="${folderName}" style="filter: invert(0);">
                        <h2>${r.title}</h2>
                        <p>${r.description}</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Error fetching folders:", error);
    }
}

async function getSongs(folder) {
    try {
        let response = await fetchWithAuth(`https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${folder}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch songs: ${response.statusText} (Status code: ${response.status})`);
        }

        let data = await response.json();
        songs = [];

        data.forEach(item => {
            if (item.name.endsWith(".mp3")) {
                songs.push(item.name.split(".mp3")[0]); // Push song name without .mp3
            }
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function getCircularElement(arr, index) {
    return arr[(index % arr.length + arr.length) % arr.length];
}

const playMusic = (track, pause = false) => { 
    currSong.src = `https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${currFolder}/` + track + `.mp3`;
    if (!pause) {
        currSong.play();
        document.getElementById("pl").src = "material/pause.svg";
    }
    document.querySelector(".above .songInfo").innerHTML = track;
    document.querySelector(".above .songTime").innerHTML = `00:00/${formatTime(currSong.duration || 0)}`;
}

async function updateSongs(folder) {
    songs = await getSongs(folder); // Get list of all the songs
    playMusic(songs[0], true); // First song always in playBar
    let content = document.querySelector(".scroll");
    content.innerHTML = "";
    
    for (let element of songs) {
        content.innerHTML += `
            <div class="card">
                <div class="flex jc">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
                            <circle cx="6.5" cy="18.5" r="3.5" stroke="currentColor" stroke-width="1.5" />
                            <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" />
                            <path d="M10 18.5L10 7C10 6.07655 10 5.61483 10.2635 5.32794C10.5269 5.04106 11.0175 4.9992 11.9986 4.91549C16.022 4.57222 18.909 3.26005 20.3553 2.40978C20.6508 2.236 20.7986 2.14912 20.8993 2.20672C21 2.26432 21 2.4315 21 2.76587V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 10C15.8667 10 19.7778 7.66667 21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                    <div class="content flex column jc">
                        <p>${element}</p>
                        <p>Vikhyat</p>
                    </div>
                </div>
                <div class="playMusic">
                    <img src="material/play.svg" alt="playS" style="filter: invert(0); opacity: 1;">
                </div>
            </div>
        `;
    }
}
    
function playPreviousSong() {
    const src = currSong.src; 
    const songName = src.split(`https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${currFolder}/`)[1].split(".mp3")[0]; // Extract the song name from the URL
    const prevSong = getCircularElement(songs, songs.indexOf(songName) - 1); 
    playMusic(prevSong);
}

function playNextSong() {
    const src = currSong.src; 
    const songName = src.split(`https://api.github.com/repos/vikhyatcharak/Spotify-Clone/contents/spotify%20clone/songs/${currFolder}/`)[1].split(".mp3")[0]; // Extract the song name from the URL
    const nextSong = getCircularElement(songs, songs.indexOf(songName) + 1); 
    playMusic(nextSong);
}

async function main() {
    await getFolders();
    await updateSongs(currFolder);

    // Event listener for left section play button
    document.querySelector(".scroll").addEventListener("click", event => {
        if (event.target.closest(".playMusic")) {
            const card = event.target.closest(".card");
            const songName = card.querySelector(".content").firstElementChild.innerHTML.trim();
            playMusic(songName);
            document.getElementById("pl").src = "material/pause.svg";
        }
    })

    // Event listener for Play/Pause button in seekbar
    document.getElementById("pl").addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            document.getElementById("pl").src = "material/pause.svg";
        } else {
            currSong.pause();
            document.getElementById("pl").src = "material/play.svg";
        }
    })

    // Event listener for currSong time update in playBar
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".above").querySelector(".songTime").innerHTML = `${formatTime(currSong.currentTime)}/${formatTime(currSong.duration || 0)}`;

        //event listener for change in circle as song proceeds
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration * 100) + "%";

        if (formatTime(currSong.currentTime) == formatTime(currSong.duration)) {
            playNextSong();
        }
    })

    // Event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect(),e.offsetX) //getBoundingClientRect() tells where height,width,x,y of the element // offsetX found from console.log(e)
        
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = (percent * currSong.duration) / 100;
    })

    // Event listener for hamburger img
    document.querySelector(".hamburger img").addEventListener("click", (e) => {
        const leftElement = document.querySelector(".left");
        const parentWidth = leftElement.offsetParent.offsetWidth; // Get the parent's width
        const currentLeftPx = window.getComputedStyle(leftElement).left; // Get `left` in px
        const currentLeft = Math.round((parseFloat(currentLeftPx) / parentWidth) * 100); // Convert px to %, rounded to nearest integer

        if (currentLeft == -110) {
            leftElement.style.left = "0%";
            e.target.src = "material/cross.svg";
        } else {
            leftElement.style.left = "-110%";
            e.target.src = "material/hambur.svg";
        }
    })

    // Event listeners for previous and next buttons
    document.getElementById("p").addEventListener("click", () => {
        playPreviousSong();
    })

    document.getElementById("n").addEventListener("click", () => {
        playNextSong();
    })

    // Event listener for volume range and to mute
    document.getElementById("volRange").addEventListener("change", (e) => {
        if (currSong.muted) {
            currSong.muted = false;
             document.querySelector(".timevol").querySelector(".vol").firstElementChild.src="material/vol.svg"
        }
        currSong.volume = parseFloat(e.target.value/100)
    })

    // Event listener for mute button
    document.querySelector(".timevol").querySelector(".vol").firstElementChild.addEventListener("click",e=>{
        if(!currSong.muted){
            currSong.muted=true;
            document.getElementById("volRange").value=0
            e.target.src="material/mute.svg"
        }else{
            currSong.muted=false
            currSong.volume=0.2
            document.getElementById("volRange").value=20
            e.target.src="material/vol.svg"
        }
    })

    //event listener for green button on playlists
    let folderSection=document.querySelector(".container").querySelector(".right").querySelector(".section").querySelector(".cardContainer")
    let folderArr=folderSection.getElementsByClassName("card")
    Array.from(folderArr).forEach(e=>{
        e.querySelector(".green-button").addEventListener("click", async ()=>{
            // console.log(e.querySelector("h2").innerHTML)
            currFolder=e.querySelector("h2").innerHTML
            await updateSongs(currFolder)
        })
    })
}
main()
