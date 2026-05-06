import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

//  в TypeScript лучше использовать свои типизированные версии
//  создаёт удобные useAppDispatch и useAppSelector,чтобы TypeScript понимал store
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
