export function send({ title, body, icon }: { title: string; body: string; icon: string }) {
	if (Notification.permission === "granted") {
		new Notification(title, { body, icon });
		return true;
	}
	return false;
}
