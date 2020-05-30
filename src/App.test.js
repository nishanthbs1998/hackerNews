import React from 'react';
import App from './App';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {Search,Table,Button} from './App';
import Adapter from 'enzyme-adapter-react-16';
import {shallow,configure} from 'enzyme';

configure({adapter:new Adapter()});


describe('App',()=>{
  it('renders',()=>{
    const div=document.createElement('div');
    ReactDOM.render(<App />,div);
  });

    test('snapshot',()=>{
      const component=renderer.create(<App />);
      let tree=component.toJSON();
      expect(tree).toMatchSnapshot();
    })
});

describe('Search',()=>{
  
  it('renders',()=>{
    const div=document.createElement('div');
    ReactDOM.render(<Search>Search</Search>,div);
  });

  test('snapshot',()=>{
    const component=renderer.create(<Search>Search</Search>);
    let tree=component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Button',()=>{
  it('renders',()=>{
    const div=document.createElement('div');
    ReactDOM.render(<Button>Button test</Button>,div);
  });

  test('snapshot',()=>{
    const component=renderer.create(<Button>Button test</Button>);
    let tree=component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Table',()=>{
  const props={
    list:[{ title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
    { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }],sortKey:'TITLE',isSortReverse:false
  };

  it('renders',()=>{
    ReactDOM.render(<Table {...props}/>,document.createElement('div'));
  });

  test('snapshot',()=>{
    const component=renderer.create(<Table {...props}/>);
    let tree=component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows two items in the list',()=>{
    const element=shallow(<Table {...props}/>);
    expect(element.find('.table-row').length).toBe(2);
  })
})

// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });
