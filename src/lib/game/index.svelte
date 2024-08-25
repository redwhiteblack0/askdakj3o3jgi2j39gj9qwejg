<script lang="ts">
    import { onMount } from "svelte";

    let appRef: any = null;
    let pochaccoRef: any = null;
    let pochaccoImgRef: any = null;

    let pY = 0;
    let pX = 0;

    onMount(() => {
        window.onkeydown = (e: any) => {
            if (e.code === "ArrowDown") {
                if (pochaccoRef) {
                    pY += 10;
                }
            }

            if (e.code === "ArrowUp") {
                if (pochaccoRef) {
                    pY -= 10;
                }
            }

            if (e.code === "ArrowLeft") {
                if (pochaccoRef) {
                    pX -= 10;
                }
            }

            if (e.code === "ArrowRight") {
                if (pochaccoRef) {
                    pX += 10;
                }
            }

            if(e.code === "Space") {
                if (pochaccoRef) {
                    const pYNow = pY;
                    pY -= 50;
                    setTimeout(() => {
                        pY = pYNow
                    }, 250)
                }
            }

            if(e.code === "KeyK") {
                if (pochaccoImgRef) {
                    pochaccoImgRef.src = "./pochacco-kiss-01.png"

                    setTimeout(() => {
                        pochaccoImgRef.src = "./pochacco-icon-01.png"
                    }, 2500)
                }
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
    <div
        id="pochacco-icon"
        bind:this={pochaccoRef}
        style={`transform: translate(${pX}px, ${pY}px)`}
    >
        <img src="./pochacco-icon-01.png" alt="" bind:this={pochaccoImgRef} />
    </div>
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
