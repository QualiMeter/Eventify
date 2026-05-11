import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = (): signalR.HubConnection => {
	if (!connection) {
		connection = new signalR.HubConnectionBuilder()
			.withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/hubs/notifications`, {
				accessTokenFactory: () => localStorage.getItem('jwt_token') || '',
			})
			.withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
			.configureLogging(signalR.LogLevel.Warning)
			.build();

		connection.onclose(() => console.warn('SignalR connection lost. Reconnecting...'));
	}
	return connection;
};

export const startSignalRConnection = async (): Promise<void> => {
	const conn = getSignalRConnection();
	if (conn.state !== signalR.HubConnectionState.Connected) {
		try {
			await conn.start();
			console.info('SignalR connected.');
		} catch (err) {
			console.error('SignalR start failed:', err);
		}
	}
};

export const stopSignalRConnection = async (): Promise<void> => {
	if (connection) {
		await connection.stop();
		connection = null;
	}
};