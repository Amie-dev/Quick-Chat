


export const initializeSocket=async(io)=>{
    io.on("connection",async(socket)=>{
        console.log("socket io connected with id",socket.id)
    })
}