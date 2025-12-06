<script lang="ts">
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";

    const char_models = ["./pochacco-icon-01.png", "./pochamii-sprite.png"];

    let player_session_id = nanoid();

    let appRef: any = null;

    let character_selection_complete = false;

    let myCharRef: any = null;
    let myCharImgRef: any = null;

    let my_player_number = -1;
    let my_model_selected = -1;

    let my_pY = 0;
    let my_pX = 0;

    let o_player_number = -1;
    let oCharRef: any = null;
    let oCharImgRef: any = null;

    let o_model_selected = -1;

    let o_pY = 0;
    let o_pX = 0;

    let touchstartY = 0;
    let touchendY = 0;

    let is_kissing = false;

    const handle_select_char = async (player_id: number) => {
        const events = [
            {
                type: "CHAR-SELECT",
                payload: player_id,
                player_session_id,
                time: Date.now(),
            },
        ];
        try {
            const send_events_res = await fetch("/api/send-events", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ events }),
            });

            const send_events_res_json = await send_events_res.json();
            console.log("CHAR SELECT RES: ", send_events_res_json);
        } catch (err) {
            console.log("Error sending character select to server: ", err);
            alert(
                "Couldn't select your character. Please call Elvis to fix it. I'm sorry my love :(",
            );
        }
    };

    const handle_receive_kiss = () => {
            const oldMyCharImgSrc = myCharImgRef.src;
            const oldOCharImgSrc = oCharImgRef.src;

            my_pX = 0;
            my_pY = 0;
            o_pX = 0;
            o_pY = 0;

            myCharImgRef.src = "./pochacco-kiss-01.png";
            oCharImgRef.src = "./empty-icon.png";

            setTimeout(() => {
                myCharImgRef.src = oldMyCharImgSrc;
                oCharImgRef.src = oldOCharImgSrc

                // my_pX = new_pos.my_pX;
                // my_pY = new_pos.my_pY;

                // o_pX = new_pos.o_pX;
                // o_pY = new_pos.o_pY;
            }, 2500);
        };

    onMount(() => {
        let touchTimer: any = null;

        const sse = new EventSource("/api/receive-events");

        sse.onmessage = (event) => {
            const payload = JSON.parse(event.data);

            console.log("SERVER SENT EVENT PAYLOAD: ", payload);

            if (payload.type === "init") {
            }

            if (payload.type === "jump") {
                const is_active_player =
                    payload.data.sender_id === player_session_id;

                if (!is_active_player) {
                    const pYNow = o_pY;
                    o_pY -= 50;
                    setTimeout(() => {
                        o_pY = pYNow;

                        touchstartY = 0;
                        touchendY = 0;
                    }, 250);
                }
            }

            if(payload.type === "kiss") {
                const is_active_player = payload.data.sender_id === player_session_id;

                // let my_new_pos = null;
                // let o_new_pos = null;

                // if(i_am_player_1) {
                //     my_new_pos = payload.data.new_state.player_1.last_pos;
                //     o_new_pos = payload.data.new_state.player_2.last_pos;
                // } else {
                //     my_new_pos = payload.data.new_state.player_2.last_pos;
                //     o_new_pos = payload.data.new_state.player_1.last_pos;
                // }

                if(!is_active_player) {
                    handle_receive_kiss()
                }
            }

            if (payload.type === "move") {
                const is_active_player = payload.data.sender_id === player_session_id;
                // console.log(player_session_id, payload.data.sender_id)

                // NOTE: only need to move player if not active player
                if (!is_active_player) {
                    switch (payload.data.direction) {
                        case "X-RIGHT": {
                            o_pX += 10;
                            break;
                        }
                        case "X-LEFT": {
                            o_pX -= 10;
                            break;
                        }
                        case "Y-DOWN": {
                            o_pY += 10;
                            break;
                        }
                        case "Y-UP": {
                            o_pY -= 10;
                            break;
                        }
                    }
                }
            }

            if (payload.type === "char-select") {
                const is_active_player =
                    payload.data.sender_id === player_session_id;

                if (is_active_player) {
                    my_player_number = 1;
                    my_model_selected =
                        payload.data.new_state.player_1.char_selected;
                    my_pX =
                        payload.data.new_state.player_1.last_pos.pX *
                        window.innerWidth *
                        0.5;
                    my_pY =
                        payload.data.new_state.player_1.last_pos.pY *
                        window.innerHeight *
                        0.5;

                    o_player_number = 2;
                    o_model_selected =
                        payload.data.new_state.player_2.char_selected;
                    o_pX =
                        payload.data.new_state.player_2.last_pos.pX *
                        window.innerWidth *
                        0.5;
                    o_pY =
                        payload.data.new_state.player_2.last_pos.pY *
                        window.innerHeight *
                        0.5;
                } else {
                    my_player_number = 2;
                    my_model_selected =
                        payload.data.new_state.player_2.char_selected;
                    my_pX =
                        payload.data.new_state.player_2.last_pos.pX *
                        window.innerWidth *
                        0.5;
                    my_pY =
                        payload.data.new_state.player_2.last_pos.pY *
                        window.innerHeight *
                        0.5;

                    o_player_number = 1;
                    o_model_selected =
                        payload.data.new_state.player_1.char_selected;
                    o_pX =
                        payload.data.new_state.player_1.last_pos.pX *
                        window.innerWidth *
                        0.5;
                    o_pY =
                        payload.data.new_state.player_1.last_pos.pY *
                        window.innerHeight *
                        0.5;
                }

                character_selection_complete = true;
            }

            if (payload.type === "update") {
            }
        };

        const handleKiss = async () => {
            is_kissing = true;

            const oldMyCharImgSrc = myCharImgRef.src;
            const oldOCharImgSrc = oCharImgRef.src;

            console.log("Kiss: ", oCharImgRef.src)

            // 
            my_pX = 0;
            my_pY = 0;

            o_pX = 0;
            o_pY = 0;

            myCharImgRef.src = "./pochacco-kiss-01.png";
            oCharImgRef.src = "./empty-icon.png";

            setTimeout(() => {
                myCharImgRef.src = oldMyCharImgSrc;
                oCharImgRef.src = oldOCharImgSrc

                is_kissing = false
            }, 2500);

            const events = [
                {
                    type: "K",
                    time: Date.now(),
                }
            ]

            try {
                const sent_events_res = await fetch("/api/send-events", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({ player_session_id, events }),
                });

                const send_events_res_json = await sent_events_res.json();

                console.log("SENT EVENTS RES: ", send_events_res_json);
            } catch (err) {
                console.log("ERROR SENDING EVENTS TO API: ", err);
            }
        };

        window.ontouchstart = async (e: any) => {
            if(is_kissing) {
                return
            }

            touchstartY = e.changedTouches[0].screenY;

            const events = [];
            const current_pos = { pX: my_pY, pY: my_pY };

            if (myCharRef) {
                touchTimer = setTimeout(async () => await handleKiss(), 500);
            }

            if (myCharRef) {
                const pBox = myCharRef.getBoundingClientRect();

                if (e.touches[0].clientY < pBox.top) {
                    my_pY -= 10;

                    events.push({
                        type: "MOVE",
                        direction: "Y-DOWN",
                        time: Date.now(),
                    });
                }

                if (e.touches[0].clientY > pBox.bottom) {
                    my_pY += 10;

                    events.push({
                        type: "MOVE",
                        direction: "Y-UP",
                        time: Date.now(),
                    });
                }

                if (e.touches[0].clientX < pBox.left) {
                    my_pX -= 10;

                    events.push({
                        type: "MOVE",
                        direction: "X-LEFT",
                        time: Date.now(),
                    });
                }

                if (e.touches[0].clientX > pBox.right) {
                    my_pX += 10;

                    events.push({
                        type: "MOVE",
                        direction: "X-RIGHT",
                        time: Date.now(),
                    });
                }
            }

            const new_pos = { pX: my_pX, pY: my_pY };

            try {
                const sent_events_res = await fetch("/api/send-events", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({ player_session_id, events }),
                });

                const send_events_res_json = await sent_events_res.json();

                console.log("SENT EVENTS RES: ", send_events_res_json);
            } catch (err) {
                console.log("ERROR SENDING EVENTS TO API: ", err);
            }
        };

        window.ontouchend = async (e: any) => {
            touchendY = e.changedTouches[0].screenY;

            const events = [];
            const current_pos = { pX: my_pY, pY: my_pY };

            if (touchTimer) {
                clearTimeout(touchTimer);
                is_kissing = false;
            }

            if (myCharRef) {
                if(is_kissing) {
                    return
                }

                if (touchendY < touchstartY) {
                    const pYNow = my_pY;
                    my_pY -= 50;

                    events.push({
                        type: "J",
                        time: Date.now(),
                    });

                    setTimeout(() => {
                        my_pY = pYNow;

                        touchstartY = 0;
                        touchendY = 0;
                    }, 250);
                }

                try {
                    const sent_events_res = await fetch("/api/send-events", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ player_session_id, events }),
                    });

                    const send_events_res_json = await sent_events_res.json();

                    console.log("SENT EVENTS RES: ", send_events_res_json);
                } catch (err) {
                    console.log("ERROR SENDING EVENTS TO API: ", err);
                }
            }
        };


        window.onkeydown = async (e: any) => {
            if(is_kissing) {
                return
            }

            const events = [];
            const current_pos = { pX: my_pY, pY: my_pY };

            if (e.code === "ArrowDown") {
                if (myCharRef) {
                    my_pY += 10;
                    events.push({
                        type: "MOVE",
                        direction: "Y-DOWN",
                        time: Date.now(),
                    });
                }
            }

            if (e.code === "ArrowUp") {
                if (myCharRef) {
                    my_pY -= 10;

                    events.push({
                        type: "MOVE",
                        direction: "Y-UP",
                        time: Date.now(),
                    });
                }
            }

            if (e.code === "ArrowLeft") {
                if (myCharRef) {
                    my_pX -= 10;

                    events.push({
                        type: "MOVE",
                        direction: "X-LEFT",
                        time: Date.now(),
                    });
                }
            }

            if (e.code === "ArrowRight") {
                if (myCharRef) {
                    my_pX += 10;

                    events.push({
                        type: "MOVE",
                        direction: "X-RIGHT",
                        time: Date.now(),
                    });
                }
            }

            if (e.code === "Space") {
                if (myCharRef) {
                    const pYNow = my_pY;
                    my_pY -= 50;

                    events.push({
                        type: "J",
                        time: Date.now(),
                    });

                    setTimeout(() => {
                        my_pY = pYNow;
                    }, 250);
                }
            }

            const new_pos = { pX: my_pX, pY: my_pY };

            if (e.code === "KeyK") {
                await handleKiss();
            }

            try {
                const sent_events_res = await fetch("/api/send-events", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({ player_session_id, events }),
                });

                const send_events_res_json = await sent_events_res.json();

                console.log("SENT EVENTS RES: ", send_events_res_json);
            } catch (err) {
                console.log("ERROR SENDING EVENTS TO API: ", err);
            }
        };
    });
</script>

<div class="app" bind:this={appRef}>
    <!-- <div class="title">
        <h1>POCHACCHO WORLD!!!!</h1>
    </div> -->
    <div class="title">
        <svg viewBox="0 0 500 500">
            <path
                id="curve"
                d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
            />
            <text width="500">
                <textPath xlink:href="#curve">POCHACCO WORLD!!!!</textPath>
            </text>
        </svg>
    </div>
    {#if !character_selection_complete}
        <div class="char-select">
            <div class="char-select-chars">
                <div
                    class="char-select-chars-card"
                    on:click={() => handle_select_char(0)}
                >
                    <div class="char-select-chars-icon">
                        <img src="./pochacco-icon-01.png" alt="" />
                    </div>
                    <div>
                        <p>POCHACCO</p>
                    </div>
                </div>
                <div
                    class="char-select-chars-card"
                    on:click={() => handle_select_char(1)}
                >
                    <div class="char-select-chars-icon">
                        <img src="./pochamii-sprite.png" alt="" />
                    </div>
                    <div>
                        <p>POCHAMII</p>
                    </div>
                </div>
            </div>
            <!-- <div>
                <p>Select Your Character</p>
            </div> -->
        </div>
    {:else} 
        <div
            id="pochacco-icon"
            bind:this={oCharRef}
            style={`transform: translate(calc(-50% + ${o_pX}px), ${o_pY}px)`}
        >
            <img
                src={char_models[o_model_selected]}
                alt=""
                bind:this={oCharImgRef}
            />
        </div>

        <div
            id="pochacco-icon"
            bind:this={myCharRef}
            style={`transform: translate(calc(-50% + ${my_pX}px), ${my_pY}px)`}
        >
            <img
                src={char_models[my_model_selected]}
                alt=""
                bind:this={myCharImgRef}
            />
        </div>
    {/if}
</div>

<style>
    @keyframes titleBounce {
        0% {
            transform: translate(-50%, 0);
        }
        33% {
            transform: translate(-50%, 2.5rem);
        }
        66% {
            transform: translate(-50%, -2.5rem);
        }
        100% {
            transform: translate(-50%, 0);
        }
    }

    :global(*) {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
    }

    :global(body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;

        overflow: hidden;
    }

    .app {
        width: 100vw;
        height: 100vh;

        background-image: url("/bg-grass-01.jpg");

        overflow: hidden;
    }

    .char-select {
        display: flex;
        flex-direction: column;
        align-items: center;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%);

        color: white;
        font-family: sans-serif;
        font-weight: 800;
    }

    .char-select-chars {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 2.5rem;
    }

    .char-select-chars-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 7.5rem;
        background-color: bisque;
        border: 2px solid black;
        border-radius: 1rem;
        aspect-ratio: 9/16;
        cursor: pointer;
    }

    .char-select-chars-icon {
        width: 5rem;
        height: 5rem;
    }

    .char-select-chars-icon img {
        width: 100%;
        height: 100%;
    }

    .title {
        position: absolute;
        top: 2.5rem;
        left: 50%;

        width: 100vw;
        font-size: 2.5rem;
        font-family: sans-serif;
        text-align: center;
        color: coral;
        font-weight: 800;

        transform: translate(-50%, 0);

        animation: titleBounce 4s ease-in-out backwards infinite;
    }

    path {
        fill: transparent;
    }

    text {
        fill: #ff9800;
    }

    #pochacco-icon {
        position: absolute;
        left: 50%;
        top: 50%;

        display: flex;
        justify-content: center;
        align-items: center;

        width: 5rem;
        height: 5rem;
    }

    #pochacco-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
</style>
