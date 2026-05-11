import { useEffect, useRef } from 'react';
import { getSignalRConnection, startSignalRConnection } from '../services/signalr';

export const useSignalR = (handlers: Record<string, (...args: unknown[]) => void>) => {
	const handlersRef = useRef(handlers);

	useEffect(() => {
		handlersRef.current = handlers;
	});

	useEffect(() => {
		const conn = getSignalRConnection();
		let isMounted = true;

		const init = async () => {
			if (!isMounted) return;
			await startSignalRConnection();

			Object.entries(handlersRef.current).forEach(([event, callback]) => {
				conn.on(event, callback);
			});
		};

		init();

		return () => {
			isMounted = false;
			Object.entries(handlersRef.current).forEach(([event, callback]) => {
				conn.off(event, callback);
			});
		};
	}, []);
};