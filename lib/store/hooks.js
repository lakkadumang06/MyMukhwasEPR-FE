'use client';
import { useDispatch, useSelector } from 'react-redux';

/** Thin re-exports so components import app hooks from one place. */
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
