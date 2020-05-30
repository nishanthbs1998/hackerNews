import React from 'react';
import './App.css';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {sortBy} from 'lodash';
const DEFAULT_QUERY='redux';
const PATH_BASE='https://hn.algolia.com/api/v1';
const PATH_SEARCH='/search';
const PARAM='query=';
const DEFAULT_PAGE=0;
const PARAM_PAGE="page="
const DEFAULT_HPP=10;
const PARAM_HPP="hitsPerPage="

const SORTS={
   NONE:(list)=>list,
   TITLE:(list)=>sortBy(list,'title'),
   AUTHOR:(list)=>sortBy(list,'author'),
   COMMENTS:(list)=>sortBy(list,'num_comments').reverse(),
   POINTS:(list)=>sortBy(list,'points').reverse()
}

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state={
     results:null,
     searchKey:'',
    searchTerm:DEFAULT_QUERY,
    isLoading:false,
    sortKey:'NONE',
    isSortReverse:false
  };

    this.needsToSearchTopStories=this.needsToSearchTopStories.bind(this);
    this.fetchTopStories=this.fetchTopStories.bind(this);
    this.setSearchTopStories=this.setSearchTopStories.bind(this);
    this.onDismiss=this.onDismiss.bind(this);
    this.onSearchChange=this.onSearchChange.bind(this);
    this.onSearchSubmit=this.onSearchSubmit.bind(this);
    this.onSort=this.onSort.bind(this);
   }

   onSort(sortKey){
    const isSortReverse=this.state.sortKey===sortKey&& !this.state.isSortReverse;
     this.setState({sortKey,isSortReverse});
   }
   needsToSearchTopStories(searchTerm){
     return !this.state.results[searchTerm]//this way of using objects is called computed properties
   }
   
  setSearchTopStories(result){
    const {hits,page}=result;
//    this.setState(prevState=>{
    const{searchKey,results}=this.state;
    const oldHits=results&&results[searchKey]?results[searchKey].hits:[];
    const updatedHits=[...oldHits,...hits]
    this.setState({isLoading:false,results:{...results,[searchKey]:{hits:updatedHits,page}}});
  //  })
  }

   fetchTopStories(searchTerm,page){
   this.setState({isLoading:true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response=>response.json())
    .then(result=>this.setSearchTopStories(result));
    
  }
  

  onDismiss(id){
      const {searchKey,results}=this.state;
      const {hits,page}=results[searchKey];

      const isNotId=item=>item.objectID!==id;
      const updatedHits=hits.filter(isNotId);
      this.setState({results:{...results,[searchKey]:{hits:updatedHits,page}}});
  }

  onSearchChange(event){
    this.setState({searchTerm:event.target.value});//event.target means the component that caused the action.Here, its searchTerm
  }

  onSearchSubmit(event){
    const {searchTerm}=this.state;
    this.setState({searchKey:searchTerm});

    if(this.needsToSearchTopStories(searchTerm)){

      this.fetchTopStories(searchTerm,DEFAULT_PAGE);
    }
    event.preventDefault();//To prevent default behaviour of the browser to reload after hitting submit
  }
  
  componentDidMount(){
    console.log("MOUNTED");
    const {searchTerm}=this.state;
    this.setState({searchKey:searchTerm});
    this.fetchTopStories(searchTerm,DEFAULT_PAGE);
  }

  render(){

    const {results,searchTerm,searchKey,isLoading,sortKey,isSortReverse}=this.state
    const page=(results&&results[searchKey]&&results[searchKey].page)||0;
    const list=(results&&results[searchKey]&&results[searchKey].hits)||[];

    return(

     <div className="page">
       <div className="interactions">
       
       <Search
        value={searchTerm}
        onSubmit={this.onSearchSubmit}
        onChange={this.onSearchChange}
       >Search</Search>
       </div>
      <Table //If result is null, nothing is displayed, else table will be displayed
       list={list}
       onDismiss={this.onDismiss}
       sortKey={sortKey}
       isSortReverse={isSortReverse}
       onSort={this.onSort}/>

      <div style={{textAlign:"center"}}>

        <ButtonWithLoading
          isLoading={isLoading}
          onClick={()=>this.fetchTopStories(searchKey,page+1)}
          className="More"> 
           More        
        </ButtonWithLoading>
      
      </div>

    </div>
    );
  }

};

class Search extends React.Component{// converting this func back to class as there is a need to use a lifecycle method to activate focus
//const Search=({value,onChange,onSubmit,children})=>//we can convert this to a function here since this does not have any state or lifecycle
  
componentDidMount(){
    this.input.focus();
  }
  render(){
    const{value,onChange,onSubmit,children}=this.props;
    let input;
  return(
    <form onSubmit={onSubmit}>
    <input type="text"
      value={value}
      onChange={onChange}
      ref ={(node)=>this.input=node}// By doing this, the web site knows where to focus initially with the intention of guiding a user to get started. Here, the cursor is automatically set to search from.
      />
      <Button type="submit" className="sub" onClick={onSubmit}>{children}</Button>
      
    </form>)
  }
}

const Table=({sortKey,onSort,list,onDismiss,isSortReverse})=>{
const sortedList=SORTS[sortKey](list);
const reverseSortedList=isSortReverse?sortedList.reverse():sortedList;
return(
  <div className="table">
    <div className="table-headers">
      <span style={{width:'40%'}}>
        <Sort sortKey='TITLE'
        activateSortKey={sortKey}
        onSort={onSort}>Title</Sort>
      </span>  <span style={{width:'30%'}}>
        <Sort sortKey='AUTHOR'
        activateSortKey={sortKey}
        onSort={onSort}>Author</Sort>
      </span> <span style={{width:'10%'}}>
        <Sort sortKey='COMMENTS'
        activateSortKey={sortKey}
        onSort={onSort}>Comments</Sort>
      </span>  <span style={{width:'10%'}}>
        <Sort sortKey='POINTS'
        activateSortKey={sortKey}
        onSort={onSort}>Points</Sort>
      </span>
    </div>
    {
      reverseSortedList.map(item=>
        <div key={item.objectID} className="table-row">
          <span style={{width:'40%'}}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{width:'30%'}}>{item.author}</span>
          <span style={{width:'10%'}}>{item.num_comments}</span>
          <span style={{width:'10%'}}>{item.points}</span>
          <span style={{width:'10%'}}>
            <Button onClick={()=>onDismiss(item.objectID)}
            className="button-inline">Dismiss</Button>
          </span>
        </div>
      )
    }
    </div>
)
  }
const Button=({onClick,className='',children})=>{
 
    return(
      <button
      type="button"
    onClick={onClick}
    className={className}>{children}</button>

   
    )
  }

  const Loading=()=>
  <div style={{textAlign:"center"}}>
    <FontAwesomeIcon icon={faSpinner} /> 
  </div>

const withLoading=(Component)=>({isLoading,...rest})=>isLoading?<Loading/>: <Component {...rest}/>

const ButtonWithLoading=withLoading(Button);

const Sort=({onSort,sortKey,children,activateSortKey})=>{
  const sortClass=["button-table-header"];
  if(sortKey===activateSortKey){
    sortClass.push('button-active');
  }
  return(
<Button className={sortClass.join(' ')} onClick={()=>onSort(sortKey)}>{children}</Button>//join class to inherit button-active css property along with the original class css property
  )}
export default App;
export{
  Search,
  Table,
  Button
};
