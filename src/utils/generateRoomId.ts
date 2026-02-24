export default function generateRoomId(length: number = 6): string {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}