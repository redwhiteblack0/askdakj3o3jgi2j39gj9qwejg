// TODO:
// Start the game with both players in random, normalized coordinates.
// When Player A opens the app, send an event 
//      If Player A is the first to join, set random positions and store in memory
//      When Player B joins, get positions and set
//      * When either player joins, create an animation that plays for both players
// When a player moves, jumps, or long presses for a kiss, send event to server
//      If event is a kiss, teleport player immediately to player location and perform a kiss as well
//      * All events should be locked while a kiss is occurring

import { json } from '@sveltejs/kit';
import { game_state, broadcast } from '$lib/db';


const handle_event_char_select = (event: any) => {
    // Get values in range -1 to 1
    const player_1_random_pos_normalized = {pX: Math.random() * 2 - 1, pY: Math.random() * 2 - 1}
    const player_2_random_pos_normalized = {pX: Math.random() * 2 - 1, pY: Math.random() * 2 - 1}

    // Correlate ids
    game_state.player_1.session_id = event.player_session_id;

    game_state.player_1.id = 1;
    game_state.player_2.id = 2;

    game_state.player_1.char_selected = event.payload;
    game_state.player_2.char_selected = Math.abs(event.payload - 1);

    game_state.player_1.last_pos = player_1_random_pos_normalized;
    game_state.player_2.last_pos = player_2_random_pos_normalized
}

const handle_event_x_right = (player_session_id: string, event: any) => {

}

export async function POST({ request, cookies }: any) {
	try {
        const body = await request.json();

        console.log("SENT EVENTS: ", body);

        const sent_events = body.events;

        sent_events.forEach((event: any) => {
            switch(event.type) {
                case "CHAR-SELECT": {
                    handle_event_char_select(event);
                    console.log("NEW GAME STATE: ", game_state)

                    broadcast({
                        type: "char-select",
                        data: {
                            sender_id: event.player_session_id,
                            new_state: {
                                player_1: game_state.player_1,
                                player_2: game_state.player_2
                            }
                        }
                      });
                    break;
                }

                case "MOVE": {
                    // handle_event_x_right(body.player_session_id, event);
                    // console.log("NEW GAME STATE: ", game_state)

                    broadcast({
                        type: "move",
                        data: {
                            sender_id: body.player_session_id,
                            direction: event.direction,
                        }
                      });
                    break;
                }

                case "K": {
                    // 
                    // console.log("NEW GAME STATE: ", game_state)

                    broadcast({
                        type: "kiss",
                        data: {
                            sender_id: body.player_session_id
                        }
                      });
                    break;
                }

                case "J": {
                    // 
                    // console.log("NEW GAME STATE: ", game_state)

                    broadcast({
                        type: "jump",
                        data: {
                            sender_id: body.player_session_id
                        }
                      });
                    break;
                }

                default: {
                    console.log("RECEIVED UNCATEGORIZED EVENT: ", event);
                }
            }
        })

        return json({ success: true, time: Date.now() }, { status: 200 });
    } catch(err) {
        console.log("ERROR HANDLING SENT EVENTS: ", err);
        return json({ success: false, time: Date.now() }, { status: 500 });
    }
}
