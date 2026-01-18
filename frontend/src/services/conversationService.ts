


import apiClient from "../utils/apiClient";


export const conversationService={
    fetchConversations:async()=>{
        const response=await apiClient.get("/conversations")
        return response.data
    },
    checkConnectionCode:async(connectCode:string)=>{
        const response=await apiClient.get("/conversations/check-connect-code",{
            params:{
                connectCode
            }
        })
        return response.data;
    }
}