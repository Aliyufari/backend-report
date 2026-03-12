// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { getToken } from "@/services/auth.services";
// import { decodeToken, isExpired } from "react-jwt";

// const useToken = () => {
//     const token = getToken();
//     if(!token){ return null; }

//     const decoded: any = decodeToken(token);
//     const expired: boolean = isExpired(token);
//     if(!decoded || expired){ return null; }

//     return token;
// }

// export default useToken;