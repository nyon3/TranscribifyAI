

// ServerListItem component
export default function ServerListItem({ message }: { message: any }) {
    return (
        <li className="mb-5">
        <textarea
            readOnly
            value={message.text}
            className="border rounded-md min-w-[20rem] p-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:shadow-outline"
            rows={5}
        />
    
    </li>
    );
}
