import { useEffect, useRef } from 'react';

// https://blog.logrocket.com/accessing-previous-props-state-react-hooks/
export const usePrevious = (value: unknown) => {
	const ref = useRef<unknown>();
	useEffect(() => {
		ref.current = value; //assign the value of ref to the argument
	}, [value]); //this code will run when the value of 'value' changes
	return ref.current; //in the end, return the current ref value.
};
