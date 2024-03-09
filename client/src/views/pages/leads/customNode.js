import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';

const Node = styled.div`
  padding: 10px 20px;
  border-radius: 5px;
  background: ${(props) => props.theme.nodeBg};
  color: ${(props) => props.theme.nodeColor};
  border: 1px solid ${(props) => (props.selected ? props.theme.primary : props.theme.nodeBorder)};

  .react-flow__handle {
    background: ${(props) => props.theme.primary};
    width: 8px;
    height: 10px;
    border-radius: 5px;
  }
`;

export default memo(({ data, selected }) => {
  return (
    <div style={{backgroundColor:data.color,borderRadius:'5px'}}>

    <Node selected={selected} >
      <Handle type="target" position={Position.Left} />
      <div >
        <strong>{data.label}</strong>
        <p style={{marginTop:'-2px'}}>{data.date}</p>
        <div style={{width:130}}>
        <p style={{marginTop:'-5px',fontSize:12}} width={20}>{data.comment}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </Node>
    </div>

  );
});
