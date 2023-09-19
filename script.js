onload = function () {
    // create a network
    var probData;
    var numVertices;
    var container = document.getElementById('mynetwork');
    var container2 = document.getElementById('mynetwork2');
    var genNew = document.getElementById('generate-graph');
    var solve = document.getElementById('solve');
    var temptext = document.getElementById('temptext');
    var temptext2 = document.getElementById('temptext2');
    
    // List of cities
    const cities = ["New York", "Denver", "California", "San Fransisco", "Las Vegas", 
                    "Seattle", "Chicago", "Los Angeles", "Dallas", "Columbus"];

    // Configuration object for vis graph
    const configurationObject = {
        
        // Add configuration related to the edges
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },

        // Add configuration related to the nodes
        nodes: {
            font: '12px arial red',
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\u25CF',
                size: 40,
                color: '#991133',
            }
        }
    };

    // Function to create data for our travel planner project
    function createDataForTravelPlanner(){

        // Initialising number of nodes in the graph dynamically
        numVertices = Math.floor(Math.random() * cities.length) + 1;

        // Create data for nodes
        let nodes = [];
        for(let i = 1; i <= numVertices; i++){

            // Storing the id and the name of the city
            nodes.push({ id: i, label: cities[i - 1] })
        }

        // Creating data for edges
        let edges = [];
        for(let i = 2; i <= numVertices; i++) {
        
            // Randomly picking a neighbour node from 0 to i - 1 to create an edge
            let neighbour = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1);

            // Adding the edge between the node and the  neighbour
            edges.push({ type: 0, // 0 denotes bus route and 1 denotes air route
                        from: i, // the node 
                        to: neighbour, // the neighbour
                        color: 'orange',  // color of the edge
                        label: String(Math.floor(Math.random() * 70) + 30)  //random distance 
                        });
        }

        src = 1;
        dst = numVertices;

        // Add randomness to the edges in the graph
        for(let i = 1; i <= numVertices/2; ){

            // Generate two random integers in the range of 1 to numVertices
            let n1 = Math.floor(Math.random() * numVertices) + 1;
            let n2 = Math.floor(Math.random() * numVertices) + 1;

            if(n1 != n2) {

                if(n1 < n2) {
                    // swap n1 and n2 to make n1 larger than n2
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }

                // Create a flag to store three states:
                // 1. Assign value of 0 if there is no edge between n1 and n2
                // 2. Assign value of 1 if there is an edge denoting the bus route
                // 3. Assign value of 2 if there is an edge denoting the aeroplane route
                let works = 0;

                // Iterate for all the edges
                for(let j = 0; j < edges.length; j++) {

                    // Check if edge between n1 and n2 already exists
                    if(edges[j]['from'] === n1 && edges[j]['to'] === n2) {
                        
                        // Check for the bus route
                        if(edges[j]['type'] === 0)
                            works = 1; // flag to denote bus route exist
                        else
                            works = 2; // flag to denote air route exist
                    }
                }

                // Check if a bus or no route exists between n1 and n2
                if(works <= 1) {
                    
                    // If no route exists
                    if (works === 0 && i < numVertices / 4) {

                        // Create an edge between n1 and n2
                        edges.push({
                                type: 0,
                                from: n1,
                                to: n2,
                                color: 'orange',
                                label: String(Math.floor(Math.random() * 70) + 30)
                        });
                    } else {

                        // Create an edge for air route between n1 and n2
                        edges.push({
                                type: 1,
                                from: n1,
                                to: n2,
                                color: 'green',
                                label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        // Creating the data object for vis
        let data = {
            nodes: nodes,
            edges: edges
        };

        // Return the final object containing the information for the graph
        return data;
    }

    function dijkstra(graph, numVertices, src) {

        // Create the array to track whether the node is visited
        let visited = Array(numVertices).fill(0);

        // Store the distance in an array in the following format:
        // Each index (denoting a node) will store an array where the first element denotes 
        // the minimum distance and the second element denotes the parent to reach the node    
        let distance = [];

        // Assign a maximum value to each node and set the parent as -1
        for(let i = 0; i < numVertices; i++)
            distance.push([10000, -1]);

        // setting the distance from source node to source node to be 0
        distance[src][0] = 0;

        for(let i = 0; i < numVertices - 1; i++) {
            
            // Initialize the index for the node whose minimum distance is not found yet
            let minIndex = -1;
            for(let j = 0; j < numVertices; j++) {
                
                // Check if the node is not visited
                if(visited[j]===0){

                    // Check if we found the index of the node whose minimum distance is 
                    // not found yet
                    if(minIndex === -1 || distance[j][0] < distance[minIndex][0]){
                        
                        // Set the index to the current node
                        minIndex = j;

                    }
                }
            }

            // Mark the node as visited
            visited[minIndex] = 1;

            // Iterate over all the neighbours of the node
            for(let j = 0; j < graph[minIndex].length; j++){
                
                // Store the neighbouring edge, node and its weight
                let edge = graph[minIndex][j];
                let neighbouringNode = edge[0];
                let neighbouringWeight = edge[1];

                // Update the minimum distance from the node to the neighbouring nodes
                // if the neighbouring nodes are not visited and we found a smaller distance
                // to reach the neighbouring nodes from the current node
                if(visited[neighbouringNode] === 0 && distance[neighbouringNode][0] > distance[minIndex][0] + neighbouringWeight){
                    
                    // Update the distance
                    distance[neighbouringNode][0] = distance[minIndex][0] + neighbouringWeight;
                    
                    // Update the parent node to reach the neighbour node
                    distance[neighbouringNode][1] = minIndex;
                }
            }
        }

        // Return the distance array
        return distance;
    }

    function solveProblem(numVertices, data) {
        
        // Create the empty array to store the graph in adjacency list form
        let graph = [];

        // Push empty arrays for every vertex in the graph        
        for(let i = 1; i <= numVertices; i++){
            graph.push([]);
        }

        // Fill the empty arrays for every vertex (denoting bus route)
        for(let i = 0; i < data['edges'].length; i++) {
            
            let edge = data['edges'][i];
            let from = edge['from'] - 1;
            let to = edge['to'] - 1;
            let weight = parseInt(edge['label']);

            // Skip the edge if it a flight route
            if(edge['type']===1)
                continue;
            
            // Push the edges in the adjacency list
            graph[to].push([from, weight]);
            graph[from].push([to, weight]);
        }
        

        let dist1 = dijkstra(graph, numVertices, src - 1);
        let dist2 = dijkstra(graph, numVertices, dst - 1);

        // Store the minimum distance to reach the destination
        let mn_dist = dist1[dst - 1][0];

        // Initialize the distance of the flight route
        let plane = 0;

        // Initialize the two vertices connected through fligh route
        let p1 = -1, p2 = -1;
        
        // Iterate over all the edges in the graph
        for(let pos in data['edges']){

            // Store the edge
            let edge = data['edges'][pos];
            
            // Check if the edge is of type flight
            if(edge['type'] === 1){

                // Store the etails of the edge
                let to = edge['to'] - 1;
                let from = edge['from'] - 1;
                let weight = parseInt(edge['label']);

                // Check if the minimum distance flight route should be
                // taken from the destination to the source route
                if( dist2[from][0] + weight + dist1[to][0] < mn_dist){
                    // Store the values                    
                    plane = weight;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0] + weight + dist2[from][0];
                }

                // Check if the minimum distance flight route should be
                // taken from the source to the destination route
                if(dist1[from][0] + weight + dist2[to][0] < mn_dist){
                    // Store the values                    
                    plane = weight;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist2[to][0] + weight + dist1[from][0];
                }
            }
        }

        // Initialize an empty array to store the edges of the solution
        const newEdges = [];

        // Check if the flight route needs to be taken
        if(plane !== 0){

            // Add the new edge for the flight with an array pointing
            // to the direction in which one should travel
            newEdges.push({
                            arrows: { 
                                to: { enabled: true}
                                }, 
                            from: p1 + 1, 
                            to: p2 + 1, 
                            color: 'green',
                            label: String(plane)
                            });
            
            // Add the new edges from source to p1
            // new_edges.concat(pushEdges(dist1, p1, false));
            pushEdges(dist1, p1, newEdges, false);

            // Add the new edges from destination p2 in reverse order
            // new_edges.concat(pushEdges(dist2, p2, true));
            pushEdges(dist2, p2, newEdges, true);

        } 
        // No flight route needed
        else {
            // Add the new edges from source to destination
            pushEdges(dist1, dst - 1, newEdges, false);
        }

        // Create the data to be visualize using vis.js
        data = {
            nodes: data['nodes'],
            edges: newEdges
        };

        // Return the final solution of the problem
        return data;
    }

    function pushEdges(dist, node, newEdges, reverse) {

        // Iterate from the node to the starting node while executing
        // Dijkstra's algorihtm
        while(dist[node][0] != 0){

            // Store the next node to reach the starting node
            let nextNode = dist[node][1];

            // Check if we need to add the edges in reverse direction
            if(reverse){
                
                // Add the new edge in reverse direction i.e., from
                // the node to its next node to reach the source node
                newEdges.push({
                        arrows: { to: { enabled: true} },
                        from: node + 1, 
                        to: nextNode + 1, 
                        color: 'orange', 
                        label: String(dist[node][0] - dist[nextNode][0])
                        });
            }
            else{
                                
                // Add the new edge from the next node to the current
                // node to reach the source node
                newEdges.push({
                        arrows: { to: { enabled: true} },
                        from: nextNode + 1, 
                        to: node + 1, 
                        color: 'orange', 
                        label: String(dist[node][0] - dist[nextNode][0])
                        });
            }

            // Update the current node
            node = nextNode;
        }
    }

    // Initialize the network graph using vis
    var network = new vis.Network(container);
    network.setOptions(configurationObject);

    // Initialize the network graph to render the solution using vis
    var network2 = new vis.Network(container2);
    network2.setOptions(configurationObject);

    // Add event listener to generate new problem button    
    genNew.addEventListener("click", () => {
        let graphVisData = createDataForTravelPlanner();
        network.setData(graphVisData);
        temptext2.innerText = 'Find least time path from '+cities[src - 1]+' to '+cities[dst - 1];
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
        probData = graphVisData;
    });

    // Add event listener to solve button to render the solution    
    solve.addEventListener("click", () => {
        temptext.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveProblem(numVertices, probData));
    });

};