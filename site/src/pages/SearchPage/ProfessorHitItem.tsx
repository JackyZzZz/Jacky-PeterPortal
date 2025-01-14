import React, { FC } from 'react';
import './HitItem.scss';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setProfessor } from '../../store/slices/popupSlice';
import { isMobile } from 'react-device-detect';

import { ProfessorGQLData } from '../../types/types';

interface ProfessorHitItemProps extends ProfessorGQLData {
}

const ProfessorHitItem: FC<ProfessorHitItemProps> = (props: ProfessorHitItemProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const activeProfessor = useAppSelector(state => state.popup.professor);

    const onClickName = () => {
        // set the professor popup
        dispatch(setProfessor(props))

        // if click on a professor that is already in popup
        // or if on mobile
        if (activeProfessor && props.ucinetid == activeProfessor.ucinetid || isMobile) {
            history.push(`/professor/${props.ucinetid}`)
        }
    }

    return (
        <div className='hit-item' onClick={onClickName}>
            <div style={{ marginRight: '16px', minWidth: '50px', maxWidth: '50px', height: '50px', borderRadius: '50px', background: '#74D1F6', display: 'flex', alignItems: 'center' }}>
                <h3 style={{ width: '100%', textAlign: 'center', color: 'white' }}>
                    {props.name.split(' ').map((x: string) => x[0])}
                </h3>
            </div>
            <div style={{ width: '100%' }}>
                <h3>
                    <span>{props.name}</span>
                </h3>
                <h4 className={'hit-subtitle'}>
                    {props.department}&nbsp;･&nbsp;
                    {props.title}
                </h4>

                {Object.keys(props.course_history).length > 0 &&
                    <p><b>Recently taught:&nbsp;</b>
                        {Object.keys(props.course_history).map((item: string, index: number) => {
                            return <span key={`professor-hit-item-course-${index}`}>
                                {(index ? ', ' : '')}
                                <a style={{ color: 'black' }} href={'/course/' + item.replace(/\s+/g, '')}>
                                    {item}
                                </a>
                            </span>
                        })}
                    </p>
                }
            </div>
        </div>
    )
};


export default ProfessorHitItem;