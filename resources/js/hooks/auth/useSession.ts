// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { getToken, removeToken } from "@/services/auth.services";
// import { decodeToken, isExpired } from "react-jwt";

// type Decoded = {
//   "iss": string;
//   "iat": number;
//   "exp": number;
//   "nbf": number;
//   "jti": string;
//   "sub": string;
//   "prv": string;
//   "role": string;
// }

// const useSession = () => {
//     const token = getToken();
//     if(!token){ return null; }

//     const decoded: any = decodeToken(token);
//     const expired: boolean = isExpired(token);
//     if(!decoded || expired){
//         removeToken();
//         window.location.reload();
//         return {} as Decoded;
//     }

//     return decoded as Decoded;
// }

// export default useSession;