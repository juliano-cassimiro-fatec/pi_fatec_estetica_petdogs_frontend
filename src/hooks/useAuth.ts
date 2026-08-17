import { useContext } from "react";
import { AuthContext } from "../app/AuthContextObject";

export function useAuth() {
   return useContext(AuthContext);
}