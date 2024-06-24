import "../css/main.css";

export default function main() {
    return (


        <main class="container" style={{
            backgroundColor: "gray"
        }}>
            
            <div class="header_text">Disease Prediction</div>
            <div class="main_contents">
            
                
                <div class="dd">
                    <div class="danger_list">danger_list</div>
                    <div class="local">
                        <div class="mini_map">mini_map</div>
                        <div class="number_of_medical">number_of_medical</div>
                    </div>
                    <div class="behavior">behavior</div>
                   
                </div>
                <div class="chat_bot"></div>
            </div>
        </main>

        
    )
}

const Connector = () => {
    fetch("./")
    .then((response) => response.json())
    .then((json) => {
        data = json.items;
        data.json(data)


        
    })
}