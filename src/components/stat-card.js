import styled from 'styled-components'

export const StatCard = ({value, name}) => (
  <Wrapper>
    <h2>{value}</h2>
    <p>{name}</p>
  </Wrapper>
)

const Wrapper = styled.div`
  border-radius: 10px;
  background: white;
  flex-grow: 1;
  max-width: 20%;
  padding: 5px 15px 5px 15px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));

  @media only screen and (max-width: 702px) {
    max-width: 100%;
    flex-grow: 0;
  }
`

export const StatCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin-top: ${props => props.marginTop ? 20 : 0}px;

  @media only screen and (max-width: 702px) {
    height: ${props => props.children.length*1.25*100}px;
    flex-direction: column;
  }
`
