import $ from "jquery";
import { generateUniqueId } from "../utils/idGenerator";
import $storage from "./storage";

const audioContainerId = generateUniqueId();
$("body").append(/*html*/ `<div id="${audioContainerId}" class="audio-container"></div>`);

export function backgroundMusic() {
	const id = generateUniqueId();
	$(`#${audioContainerId}`).append(/*html*/ `
        <audio id="${id}" loop>
            <source src="./audio/Ixora Ignition.mp3" type="audio/mpeg">
        </audio>`);

	const muteButtonId = generateUniqueId();
	$("body").append(/*html*/ `
        <div id="${muteButtonId}" class="cyber-btn position-fixed bottom-4 left-4 z-[50] py-2 px-4">
            <i class="bi bi-volume-mute-fill text-2xl"></i>
        </div>`);

	if ($storage.getOrSet("music:background", true) === true) {
		($(`#${id}`)[0] as HTMLAudioElement).play();
		$(`#${muteButtonId} > i`).removeClass("bi-volume-mute-fill").addClass("bi-volume-up-fill");
	}

	$(`#${muteButtonId}`).on("click touchstart", function () {
		const audio = $(`#${id}`)[0] as HTMLAudioElement;
		if (audio.paused) {
			audio.play();
			audio.muted = false;
		} else {
			audio.muted = !audio.muted;
		}

		$storage.set("music:background", !audio.muted);
		$(`#${muteButtonId} > i`)
			.removeClass(audio.muted ? "bi-volume-up-fill" : "bi-volume-mute-fill")
			.addClass(audio.muted ? "bi-volume-mute-fill" : "bi-volume-up-fill");
	});
}
