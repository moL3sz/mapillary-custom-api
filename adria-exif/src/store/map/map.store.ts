

import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface MapState {
	coordinates: {
		lat: number,
		lng: number,
	},
	angle: number
}

// Define the initial state using that type
const initialState: MapState = {
	coordinates: {
		lat: 0,
		lng: 0,
	},
	angle: 0,
}

export const mapSlice = createSlice({
	name: 'map',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		setCoordinates(state, {payload}: PayloadAction<typeof initialState.coordinates>){
			state.coordinates = payload;
		},
		setViewAngle(state, {payload}: PayloadAction<number>){
			state.angle = payload;
		}
	},
})

export const { setCoordinates, setViewAngle} = mapSlice.actions
export const mapReducer = mapSlice.reducer;