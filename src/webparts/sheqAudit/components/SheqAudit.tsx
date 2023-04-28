import * as React from 'react';
import { useState } from 'react';
import { useBoolean } from '@fluentui/react-hooks';
import '../../../../assets/dist/tailwind.css';
import useCollapse from 'react-collapsed';
import styles from './SheqAudit.module.scss';
import { ISheqAuditProps } from './ISheqAuditProps';
import { ArrowUpOnSquareIcon, ChevronDownIcon, ChevronUpIcon, ClipboardDocumentCheckIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { spfi, SPFI, SPFx as spSPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import "@pnp/sp/site-users/web";
// import "@pnp/sp/files";
// import "@pnp/sp/folders";
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import SpfxProjects from './Projects';
import { MultiSelect } from "react-multi-select-component";
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'office-ui-fabric-react';
import Vector from '../assets/Vector.png';
import Image from '../assets/Image.png';
import DeleteButton from '../assets/Delete-Button.png';

// Audit -> Groups -> Questions
interface AuditItem {
  Id?: number;
  audit_id: string;
  archived?: string;
  owner_name?: string;
  owner_id?: string;
  total_score?: number;
  total_max_score?: number;
  score_percentage?: string;
  project_id?: string;
  project_name?: string;
  date_started?: string;
  date_completed?: string;
  answers?: string;
  actionItems: string;
  answersObj?: Array<Group>;
  summary?: string;
}

interface Group {
  title: string;
  totalAnswered?: number;
  numberOfActions?: number;
  questions: Array<Question>;
}

interface Question {
  id?: string;
  audit_item_id?: number;
  score?: number;
  maxScore: number;
  title: string;
  scoreType: ScoreType;
  note?: string;
  selectedScoreType?: string;
  actions?: any;
  notes?: any;
}

interface ScoreType {
  compliant: number;
  Non_Compliant: number;
  Scope_for_improvement: number;
  commendable: number;
  na: number;
}

function QuestionSection(props: {
  title: string,
  questionInfo: Question,
  subcontractors: Array<any>,
  updateScore: Function,
  updateActionData: Function,
  updateNotes: Function,
  sp: any
}): JSX.Element {
  const [showInput1, setShowInput1] = useState(false);
  const [showInput2, setShowInput2] = useState(false);
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [actionInfo, setActionInfo] = useState({
    action: props.questionInfo?.actions?.action || '',
    requiredDate: props.questionInfo?.actions?.requiredDate || ''
  });

  const saveCancelButton = "border-solid border-2 border-gray-600 inline-flex items-center rounded border border-transparent mt-3 px-4 py-2 text-black font-bold shadow-md";
  const scoringButtons = `${styles['answer-button']} flex text-center rounded border border-transparent text-white font-bold py-2 px-4 cursor-pointer`;
  const borderStyle = "border-solid border-1 border-gray-300  mb-3 p-3 rounded-lg";

  const updateScore = (questionInfo: Question, scoreType: 'compliant' | 'Non_Compliant' | 'Scope_for_improvement' | 'commendable' | 'na') => {
    const score = questionInfo.scoreType[scoreType];

    questionInfo.selectedScoreType = scoreType;

    const question: Question = {
      ...questionInfo,
      selectedScoreType: scoreType,
      score
    }

    props.updateScore(question);
  }

  const options = props.subcontractors.map((subcontractor) => {
    return { label: subcontractor.Title, value: subcontractor.Title }
  })

  const [notes, setNotes] = useState(props.questionInfo?.notes || '');
  const [subcontractor, setSubContractor] = useState(props.questionInfo?.actions?.subcontractor || []);

  const questionInfo = props.questionInfo;
  const answerButtons: Array<{ title: string, slug: 'compliant' | 'Non_Compliant' | 'Scope_for_improvement' | 'commendable' | 'na', answeredColor: string }> = [{
    title: "Compliant",
    slug: "compliant",
    answeredColor: "bg-green-500"
  }, {
    title: "Non-compliant",
    slug: "Non_Compliant",
    answeredColor: "bg-red-500"
  }, {
    title: "Scope for Improvement",
    slug: "Scope_for_improvement",
    answeredColor: "bg-yellow-500"
  }, {
    title: "Commendable",
    slug: "commendable",
    answeredColor: "bg-blue-500"
  }, {
    title: "N/A",
    slug: "na",
    answeredColor: "bg-gray-500"
  }]

  const createAction = () => {
    questionInfo.actions = {
      ...actionInfo,
      subcontractor: subcontractor
    }

    setShowInput2(false);
    props.updateActionData(questionInfo)
  }

  const createNotes = () => {
    questionInfo.notes = notes

    setShowInput1(false);
    props.updateNotes(questionInfo)
  }

  const onInputChange = (event: any) => {
    const stateActionInfo: any = {
      ...actionInfo
    }

    stateActionInfo[event.target.name] = event.target.value;
    setActionInfo(stateActionInfo);
  }

  const fileUpload = async (event: any) => {
    const file = event.target.files
    console.log(file)
    // const fileNamePath = encodeURI(file.name);
    // if (file.size <= 10485760) {
    //   let result = await props.sp.web.getFolderByServerRelativePath("Shared Documents").files.addUsingPath(fileNamePath, file, {Overwrite: true});
    //   console.log(result)
    // } else {
    //   let result = await props.sp.web.getFolderByServerRelativePath("Shared Documents").files.addChunked(fileNamePath, file, (data: any) => {
    //     console.log(`progress`, result);
    //   }, true);
    // }
  }

  return (
    <div className={borderStyle}>
      <h3 className='pl-2 pr-2 text-lg font-semibold'>{questionInfo.title}</h3>

      <div className='flex space-x-2 space-y-2 flex-wrap justify-center items-baseline'>
        {
          answerButtons.map((answerButton) => {
            return (
              <button
                onClick={() => updateScore(questionInfo, answerButton.slug)}
                className={`${scoringButtons} ${questionInfo.score !== undefined && questionInfo.selectedScoreType === answerButton.slug ? answerButton.answeredColor : 'bg-white items-center flex flex-col sm:items-center flex flex-col md:items-center flex flex-col'}`}>{answerButton.title}</button>
            )
          })
        }
        <br />
      </div>

      <div className='grid grid-cols-1 mt-3'>

        {/* NOTES INPUT SETUP */}
        {showInput1 ? (
          <div className={`${borderStyle} flex-1 justify-center items-center place-content-start`}>
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Notes
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    name="notes"
                    id="notes"
                    placeholder="Enter notes here..."
                    className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className='flex items-center place-content-start justify-start'>
                <button onClick={() => createNotes()}
                  className={`${saveCancelButton} bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md`}>Save
                </button>
                <button onClick={() => setShowInput1(false)}
                  className={`${saveCancelButton} ml-2 bg-gray-100  hover:bg-gray-300 text-black font-bold shadow-md`}>Cancel
                </button>
              </div>
            </>
          </div>
        ) : null}
        <br />

        {/* ACTION INPUT SETUP */}
        {showInput2 ? (
          <div className={`${borderStyle} flex-1 justify-center items-center place-content-start`}>

            <>

              <div>
                <label htmlFor="requiredAction" className="block text-sm font-medium text-gray-900">
                  Required Action
                </label>
                <div className="mt-1">
                  <input
                    value={actionInfo.action}
                    onChange={onInputChange}
                    type="text"
                    name="action"
                    id="action"
                    placeholder="Enter action here..."
                    className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block mt-6 text-sm font-medium text-gray-900">
                  Name of Subcontractor
                </label>
                {/* <pre>{JSON.stringify(selected)}</pre> */}
                <MultiSelect
                  options={options}
                  value={subcontractor}
                  onChange={setSubContractor}
                  labelledBy={"Select Subcontractor(s)"}
                  isCreatable={true}
                />

                <div>
                  <label htmlFor="requiredByDate" className="block mt-6 text-sm font-medium text-gray-900">
                    Required by date
                  </label>
                  <div className="mt-1">
                    <input
                      value={actionInfo.requiredDate}
                      onChange={onInputChange}
                      type="date"
                      name="requiredDate"
                      id="requiredDate"
                      className="block mb-2 w-1/2 border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

              </div>

              <div className='flex items-center place-content-start justify-start'>
                <button onClick={() => createAction()}
                  className={`${saveCancelButton} bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md`}>Create
                </button>
                <button onClick={() => setShowInput2(false)}
                  className={`${saveCancelButton} ml-2 bg-gray-100  hover:bg-gray-300 text-black font-bold shadow-md`}>Cancel
                </button>
              </div>
            </>
          </div>
        ) : null}
        <br />

        {/* FILE UPLOAD SETUP */}

      </div>

      <Modal
        isOpen={isModalOpen}
        isBlocking={false}
        onDismiss={hideModal}
      >
        <div className='m-5'>
          <div className='flex items-center justify-center'>
            <label htmlFor='dropzone-file'
              className='flex flex-col items-center justify-center w-full h-64 border-2 border-blue-700 border-dashed rounded-lg cursor-pointer'>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <img src={Vector} alt='' className='cursor-pointer mb-3' />
                <div>Browse Files to upload</div>
              </div>
              <input id='dropzone-file' type='file' className='hidden' multiple onChange={(e) => fileUpload(e)} />
            </label>
          </div>
          <div className='mt-4 p-3 flex justify-between items-center bg-indigo-100 rounded-lg'>
            <img src={Image} alt='' className='w-4 cursor-pointer' />
            <div className='flex gap-2'>
              <div>No selected File -</div>
              <img src={DeleteButton} alt='' className='w-3 cursor-pointer' />
            </div>
          </div>
        </div>
      </Modal>

      {/*ACTION BUTTONS */}
      <span className="flex justify-center ">
        <div>
          <button
            onClick={() => setShowInput1(true)}
            type="button"
            className="relative inline-flex items-center rounded-l-md border border-gray-500 bg-white px-4 py-2 text-sm font-medium text-black-700 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <PencilSquareIcon className="h-5 w-5 text-gray-700 mr-2" aria-hidden="true" />
            Add Note
          </button>
        </div>

        <button
          onClick={() => setShowInput2(true)}
          type="button"
          className="relative -ml-px inline-flex items-center border border-gray-500 bg-white px-4 py-2 text-sm font-medium text-black-700 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-700 mr-2" aria-hidden="true" />
          Add Action
        </button>


        <button
          type="button"
          className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-500 bg-white px-4 py-2 text-sm font-medium text-black-700 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={showModal}
        >
          <ArrowUpOnSquareIcon className="h-5 w-5 text-gray-700 mr-2" aria-hidden="true" />
          File Upload
        </button>
      </span>
    </div>

  );
}


function AuditGroup(props: {
  sp: any;
  title: string,
  totalAnswered: number,
  questions: Question[],
  subcontractors: Array<any>,
  updateScore: Function,
  updateActionData: Function,
  updateNotes: Function
}): JSX.Element {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  //string variable to style multiple buttons
  const chevronClassNames = "w-5 h-5 ml-1"
  return (
    <div className='collapsible w-full'>
      <div className='mt-4 mb-3 pl-3 pr-3 flex items-center bg-blue-700 text-white rounded-lg justify-between mx-3 header'  {...getToggleProps()}>
        <h1 className='text-xl font-bold sm:text-2xl'>{props.title}</h1>
        <div className='flex items-center'>
          {/* <div>
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </div> */}

          <div className='text-sm font-bold'>{(props.totalAnswered || 0)} / {(props.questions ? props.questions.length : 0)}</div>
          {isExpanded ? <ChevronUpIcon className={chevronClassNames} /> :
            <ChevronDownIcon className={chevronClassNames} />}
        </div>
      </div>
      <div {...getCollapseProps()}>
        <div className='content mx-5'>
          {props.questions.map((question: Question) => (
            <QuestionSection
              title={question.title}
              questionInfo={question}
              subcontractors={props.subcontractors}
              updateScore={props.updateScore}
              updateActionData={props.updateActionData}
              updateNotes={props.updateNotes}
              sp={props.sp} />
          ))}
        </div>
      </div>
    </div>
  );
}


// TO DO - add functionality to close other sections when one is opened
// function AuditGroup(props: {
//   title: string,
//   totalAnswered: number,
//   questions: Question[],
//   updateScore: Function
// }): JSX.Element {
//   const [isOpen, setIsOpen] = useState(false); // state variable to track open/closed state of collapsible section
//   const { getCollapseProps, getToggleProps } = useCollapse({}); // pass isOpen state to useCollapse hook

//   // function to handle toggle click and close any other open sections
//   const handleToggleClick = () => {
//     setIsOpen(!isOpen); // toggle isOpen state
//     props.updateScore(); // update score
//   };

//   // string variable to style toggle button based on open/closed state
//   const chevronClassNames = "w-5 h-5 ml-1" + (isOpen ? " transform rotate-180" : "");

//   return (
//     <div className='collapsible'>
//       <div
//         className='mt-4 mb-3 pl-3 pr-3 flex items-center bg-blue-700 text-white rounded-lg justify-between mx-3 header'
//         {...getToggleProps({ onClick: handleToggleClick })} // add onClick event to call handleToggleClick function
//       >
//         <h1 className='text-2xl font-bold'>{props.title}</h1>
//         <div className='flex items-center'>
//           <div className='text-sm font-bold'>{(props.totalAnswered || 0)} / {(props.questions ? props.questions.length : 0)}</div>
//           {isOpen ? <ChevronUpIcon className={chevronClassNames} /> : // update to use isOpen state variable
//             <ChevronDownIcon className={chevronClassNames} />}
//         </div>
//       </div>
//       <div {...getCollapseProps()}>
//         <div className='content mx-5'>
//           {props.questions.map((question: Question) => (
//             <QuestionSection
//               title={question.title}
//               questionInfo={question}
//               updateScore={props.updateScore}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
export default class SheqAudit extends React.Component<ISheqAuditProps, {}> {
  state: {
    sp: SPFI,
    audits?: Array<any>,
    masterAudits?: Array<AuditItem>,
    projects?: Array<any>,
    subcontractors?: Array<any>,
    selectedProject?: { id: string, name: string },
    currentAudit: AuditItem,
    allQuestionsAnswered?: boolean,
    user?: any
  } = {
      sp: null,
      audits: [],
      masterAudits: [],
      currentAudit: null
    }

  constructor(props: ISheqAuditProps) {
    super(props);

    const sp = spfi().using(spSPFx(this.props.spcontext));
    this.state = {
      sp,
      currentAudit: null,
      allQuestionsAnswered: false
    }
  }

  private async getAllSubcontractors(): Promise<any> {
    return await this.state.sp.web.lists.getByTitle("Subcontractor Register").items();
  }

  private async getAllProjects(): Promise<any> {
    return await this.state.sp.web.lists.getByTitle("Project Register").items();
  }

  private async setCurrentLoggedUser(): Promise<any> {
    const user = await this.state.sp.web.currentUser()

    this.setState({
      user
    })
  }

  private async getAllAudits(userId: string): Promise<any> {
    let audits = await this.state.sp.web.lists.getByTitle("Site Audit").items()
    audits = audits.filter((audit: any) => audit.owner_id === userId)

    return audits;
  }

  async componentDidMount(): Promise<void> {
    await this.setCurrentLoggedUser()
    const audits: any = await this.getAllAudits(`${this.state.user.Id}`);
    const projects: any = await this.getAllProjects();
    const subcontractors: any = await this.getAllSubcontractors();
    const selectedProject = {
      name: projects[0].ProjectName,
      id: projects[0].Id
    }

    this.initialiseState(audits, selectedProject);

    this.setState({
      projects,
      selectedProject,
      subcontractors
    })
  }

  onProjectChange = async (value: { name: string, id: number }): Promise<void> => {
    const audits: any = await this.getAllAudits(`${this.state.user.Id}`);
    this.initialiseState(audits, value);
  }

  initialiseState = (audits: any, selectedProject: any) => {
    this.setState({
      selectedProject
    })

    audits = audits.filter((audit: any) => {
      return audit.project_id === selectedProject.id && audit.owner_id === `${this.state.user.Id}` && audit.archived !== 'true'
    }).map((audit: any) => {
      return {
        Id: audit.Id,
        audit_id: audit.audit_id,
        archived: audit.archived,
        owner_name: audit.owner_name,
        owner_id: audit.owner_id,
        project_id: audit.project_id,
        project_name: audit.project_name,
        date_completed: audit.date_completed,
        date_started: audit.date_started,
        answers: audit.answers,
        summary: audit.summary,
        score_percentage: `${(parseFloat(((isNaN(audit.score_percentage) ? 0 : audit.score_percentage) || 0)) * 100).toFixed(2)}%`
      }
    });

    let currentAudit = audits[0];
    const user = this.state.user

    if (!currentAudit) {
      const answersObj = [{
        title: "Site Security",
        questions: [{
          id: "1",
          title: "Is perimeter hoarding secure with separate access for vehicles and pedestrians?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "2",
          title: "Are all access gates closed",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "3",
          title: "Is there adequate construction notices / signage displayed on site hoarding?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 1,
            na: 0
          },
          maxScore: 2
        }, {
          id: "4",
          title: "Site Register in place and completed by those arriving and leaving site",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 1,
            na: 0
          },
          maxScore: 2
        }, {
          id: "5",
          title: "Are there other breaches to site security not noted above? ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Site Setup",
        questions: [{
          id: "6",
          title: "Have statutory notices been displayed? (Hoarding licence, AF1/2, F10, Insurances, H&S Policy documents etc)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "7",
          title: "Have statutory notices and signage been displayed? (Fire & emergency, assembly point, smoking area etc)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "8",
          title: "Is there designated parking for site vehicles?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "9",
          title: "Are there other breaches to site set-up not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Access Routes",
        questions: [{
          id: "10",
          title: "Have access routes been established?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "11",
          title: "Is suitable segregation in place for pedestrians?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "12",
          title: "Are access routes free from obstructions?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "13",
          title: "Are approach roads free from muck and debris?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "14",
          title: "Are there other breaches to access routes not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Project Documentation",
        questions: [{
          id: "15",
          title: "Is project documentation available and up to date? (Prelim, CHSCP, AF1,2 / F10, TMP etc)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Project Management",
        questions: [{
          id: "16",
          title: "Is there adequate supervision for activities taking place on site?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "17",
          title: "Are there other breaches to project management not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Site Documentation",
        questions: [{
          id: "18",
          title: "Are weekly registers completed for H&S and Env Monitoring, TW checks etc",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "19",
          title: "Are Toolbox talks completed at the required intervals",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "20",
          title: "Are weekly inspections completed for work at height equipment (GA3)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "21",
          title: "Are weekly inspections completed for plant and lifting equipment (GA2)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "22",
          title: "Are there other breaches to site documentation not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Risk Assessments",
        questions: [{
          id: "23",
          title: "Have contractors submitted RAMS (& Safety statements if applicable) for their works",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "24",
          title: "Have site personnel signed RAMS ",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "25",
          title: "Are there other breaches to Risk Assessments not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Induction & Training",
        questions: [{
          id: "26",
          title: "Have personnel been inducted to the project",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "27",
          title: "Are training and skill cards retained / available on file",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "28",
          title: "Are there other breaches to induction & training not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Plant & Equipment",
        questions: [{
          id: "29",
          title: "Are GA1/TE Certs available for certified plant and equipment (Lifting equipment, chains, slings, hooks, clamps etc)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "30",
          title: "Has the user been trained & are they aware of the particular risks/identified hazards associated with that piece of work equipment.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "31",
          title: "Does plant and equipment appear in good order and fit for purpose with guards fitted where required.  Are lights, beacons and mirrors all working?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "32",
          title: "Is plant and equipment being operated in a safe manner?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "33",
          title: "Are all guards in  position. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "34",
          title: "Are there other breaches to plant and equipment not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Lifting Operations",
        questions: [{
          id: "35",
          title: "Has a lift plan been completed and briefed to relevant personnel",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "36",
          title: "Are exclusion zones established where required, is a certified banksman available to co-ordinate lifting operations",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "37",
          title: "Are there other breaches to lifting operations not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Working at Height",
        questions: [{
          id: "38",
          title: "Is scaffolding inspected, tagged & handover certificate recorded?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "39",
          title: "Is Scaffolding signage in place?  (e.g. complete, incomplete, loading bay SWL etc…)",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "40",
          title: "Housekeeping on the scaffolding in good order?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "41",
          title: "Fall protection netting in place if required?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "42",
          title: "Is scaffolding tied into the building & braced?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "43",
          title: "Scaffold boards, kick boards, sole plates, etc are in good condition?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "44",
          title: "Are all opes and leading edges fully protected?",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "45",
          title: "Evidence of mobile scaffold trained operatives available to erect?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "46",
          title: "Mobile scaffold towers erected accordingly / safely?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "47",
          title: "Are mobile scaffold towers tagged?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "48",
          title: "Are all ladders in good condition?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "49",
          title: "Are all ladders suitable for use and operated in accordance with safe systems of work?",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "50",
          title: "Are there other breaches to work at height not noted above?",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }]
      }, {
        title: "Excavations",
        questions: [{
          id: "51",
          title: "Are AF3s / excavation inspection register / permit to dig etc completed for excavations. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "52",
          title: "Has the area been scanned for services?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "53",
          title: "Are excavations protected e.g – barriers, stop blocks, edge protection?",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "54",
          title: "Is signage in place to highlight excavations. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "55",
          title: "Is shoring provided / sides battered / trench box in place (if applicable)?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "56",
          title: "Are there other breaches to excavations not noted above? ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Demolition",
        questions: [{
          id: "57",
          title: "RAMS / Asbestos Survey etc available?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "58",
          title: "Services identified, disconnected and LOTO applied. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "59",
          title: "Adequate signage erected highlighting live services, demolition works?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "60",
          title: "Are there other breaches to demolition not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Chemical Safety",
        questions: [{
          id: "61",
          title: "Is there a spill kit located on site?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "62",
          title: "Are fuels/oils etc stored in a bunded area?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "63",
          title: "Are the MSD Sheets for all identified chemicals/hazardous materials recorded on site?  Are CoSHH assessments completed where required?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "64",
          title: "Are flammable chemicals stored securely with restricted access.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "65",
          title: "Are the appropriate control systems in place, is there sufficient and adequate PPE & RPE in use or available for use?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "66",
          title: "Are there other breaches to chemical safety not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Electrical Safety",
        questions: [{
          id: "67",
          title: "Are all unsafe electrical leads, cables, untested work equipment secured and/or clearly labelled to ensure no-one can use them?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "68",
          title: "Ensure that existing services e.g.: electricity cables, gas mains etc have been identified and effective steps have been taken to prevent danger from them?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "69",
          title: "There is no evidence of over-loading electrical outlets?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "70",
          title: "Electrical works are not taking place near water/water courses/damp or wet surfaces?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "71",
          title: "Check that only 110v CTE hand tool etc are in use?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "72",
          title: "Check all connections are properly made and suitable plugs are used?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "73",
          title: "Ensure that cables and trailing leads are not trip hazards.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "74",
          title: "Ensure that suitable and sufficient task lighting is provided to enable operatives to safely carry out their work.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "75",
          title: "Are there other breaches to electrical safety not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Emergency Preparedness",
        questions: [{
          id: "76",
          title: "Emergency Evacuation procedures documented in plan and procedures / contact details posted onsite.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "77",
          title: "Is there an adequate number of First Aid Boxes on site and adequately stocked",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "78",
          title: "Is there adequate training/first aiders on site?  Are they known.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "79",
          title: "Certified fire extinguishers available throughout site and fire points highlighted.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "80",
          title: "Is fire fighting equipment tested at required intervals",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "81",
          title: "Are escape routes established (or clearly signed)  and clear of obstructions.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "82",
          title: "Are incident reports completed as required and forwarded to SHEQ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "83",
          title: "Are there other breaches to emergency preparedness not noted above? ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Personal Protective Equipment ",
        questions: [{
          id: "84",
          title: "Head protection in use.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "85",
          title: "Safety footwear in use.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "86",
          title: "Hi-Viz vest in use.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "87",
          title: "Eye protection in use (if applicable).",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "88",
          title: "Hearing protection in use (if applicable).",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "89",
          title: "If RPE required is it available.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "90",
          title: "If fall arrest / fall prevention equipment is required is it available and certified? ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "91",
          title: "Are there other breaches to personal protective equipment not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Environmental & Waste Management",
        questions: [{
          id: "92",
          title: "Designated set down areas for skips – waste management compound.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "93",
          title: "Adequate supply of skips / bins.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "94",
          title: "Environmental / Waste Management Plan in place?  Have Environmental Aspects & Impacts / Hazards & Risks being identified.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "95",
          title: "Are waste transfer notes / permits available. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "96",
          title: "Are all environmental controls as identified in Prelim / Env Plan in place and been completed.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "97",
          title: "Are there other breaches to environmental & waste management not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Quality",
        questions: [{
          id: "98",
          title: "Drawing controls in place ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "99",
          title: "Are calibration certificates available for equipment onsite if required. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "100",
          title: "Are requests for information (RFI) recorded.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "101",
          title: "Do regular meetings / discussions take place, are minutes recorded.",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "102",
          title: "Are quality non-conformances recorded. ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "103",
          title: "Are there other breaches to quality not noted above? ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Site Accommodation",
        questions: [{
          id: "104",
          title: "Welfare facilities available and in good condition with regular cleaning regimes taking place.  ",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "105",
          title: "Is hot running water, hand soap and drier available in toilet facilities?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "106",
          title: "Is a means of heating food and making hot drinks available in the canteen facility?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "107",
          title: "Is there a drying room available to change, dry and store clothing?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "108",
          title: "Are there other breaches to site accommodation not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Housekeeping",
        questions: [{
          id: "109",
          title: "Are work areas clear of hazards?",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "110",
          title: "Are contractors cleaning as they go ",
          scoreType: {
            compliant: 3,
            Non_Compliant: -3,
            Scope_for_improvement: -1,
            commendable: 3,
            na: 0
          },
          maxScore: 3
        }, {
          id: "111",
          title: "Has segregated storage been provided?  Is it in good order?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "112",
          title: "Are there other breaches to housekeeping not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Permits",
        questions: [{
          id: "113",
          title: "Are permits issued as required and valid for work conditions and closed correctly?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "114",
          title: "Are cylinders / gases stored securely in an upright position?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "115",
          title: "Are relevant controls in place?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "116",
          title: "Are there other breaches to permits not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Health Management ",
        questions: [{
          id: "117",
          title: "Are suitable controls in place to protect operatives against airborne dust, vibration, noise, musclosketal?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }, {
          id: "118",
          title: "Are there other breaches to health management  not noted above?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }, {
        title: "Covid ",
        questions: [{
          id: "119",
          title: "Is covid being managed inline with current guidance?",
          scoreType: {
            compliant: 2,
            Non_Compliant: -2,
            Scope_for_improvement: -1,
            commendable: 2,
            na: 0
          },
          maxScore: 2
        }]
      }]

      currentAudit = {
        audit_id: uuidv4(),
        archived: 'false',
        owner_name: user.Title,
        owner_id: user.Id.toString(),
        project_id: selectedProject.id,
        project_name: selectedProject.name,
        date_completed: "2023-02-01T00:00:00Z",
        date_started: "2023-03-21T12:34:56.789Z",
        total_score: 0,
        total_max_score: 0,
        score_percentage: '0%',
        answers: JSON.stringify(answersObj)
      }
    }

    currentAudit.owner_id = user.Id.toString()
    currentAudit.owner_name = user.Title

    if (currentAudit.answers) {
      const answersObj = JSON.parse(currentAudit.answers);
      currentAudit.answersObj = answersObj;
      this.isTotalQuestionsAndAnswered(answersObj)
    }

    this.setState({
      currentAudit,
      audits
    })
  }


  private async updateQuestionDetails(auditId: string, questionInfo: Question) {
    const existingAuditItem: AuditItem = this.state.audits.find((audit: AuditItem) => audit.audit_id === auditId);
    console.log('Updating action data : ', this.state.audits);

    existingAuditItem.answersObj = JSON.parse(existingAuditItem.answers);
    existingAuditItem.answersObj = existingAuditItem.answersObj.map((group: Group) => {
      group.questions = group.questions.map((question) => {
        if (question.id === questionInfo.id) {
          question = {
            ...questionInfo
          }
        }

        return question;
      })

      return group;
    });

    const answersObj = existingAuditItem.answersObj;

    existingAuditItem.answers = JSON.stringify(answersObj);

    delete existingAuditItem.answersObj;
    delete existingAuditItem.score_percentage;

    this.updateAudit(existingAuditItem.Id, existingAuditItem);
  }

  private async saveScoreToDatabase(auditId: number) {
    const updateAuditItem = this.state.audits.some(audit => audit.Id === auditId);
    if (!updateAuditItem) {
      this.createNewAudit({ ...this.state.currentAudit });
      this.isTotalQuestionsAndAnswered(this.state.currentAudit.answersObj);
      return;
    }

    const auditItem = { ...this.state.currentAudit };

    const audits = this.state.sp.web.lists.getByTitle("Site Audit");

    auditItem.answers = JSON.stringify(auditItem.answersObj);

    delete auditItem.answersObj;
    delete auditItem.score_percentage;

    await audits.items.getById(auditId).update(auditItem);

    this.isTotalQuestionsAndAnswered(this.state.currentAudit.answersObj)

    location.reload();

  }

  private async completedScore() {
    const masterAudit = this.state.currentAudit;
    if (masterAudit.archived === 'false') {
      masterAudit.archived = 'true';
      masterAudit.date_completed = new Date().toISOString()

      this.setState({ currentAudit: masterAudit })

      const audits = this.state.sp.web.lists.getByTitle("Site Audit");

      delete masterAudit.answersObj;
      await audits.items.getById(masterAudit.Id).update(masterAudit);
    }
    location.reload();
  }

  private async isTotalQuestionsAndAnswered(questions: Array<Group>) {
    const allQuestionsAnswered = questions.every((answer) => {
      return answer.questions.length === answer.totalAnswered
    })

    this.setState({ allQuestionsAnswered })
  }

  private handleSummaryChange(summary: string) {
    const currentAudit = { ...this.state.currentAudit };
    currentAudit.summary = summary || '';

    this.setState({
      currentAudit
    })
  }

  private async updateScore(auditId: string, questionInfo: Question) {
    const existingAuditItem: AuditItem = this.state.audits.find((audit: AuditItem) => audit.audit_id === auditId);
    if (!existingAuditItem) {
      console.log('Creating new Audit entry.');

      const newAuditItem: AuditItem = this.state.currentAudit;
      const clonedNewAuditItem = cloneDeep(newAuditItem);

      clonedNewAuditItem.answersObj = clonedNewAuditItem.answersObj.map((group: Group) => {
        group.questions = group.questions.map((question) => {
          if (question.id === questionInfo.id) {
            question = {
              ...questionInfo
            }
          }

          return question;
        });
        return group;
      });

      const answersObj = clonedNewAuditItem.answersObj;
      this.calculateTotalAnswered(answersObj);

      const auditScores = this.calculateAuditScores(answersObj);

      clonedNewAuditItem.project_id = this.state.selectedProject.id
      clonedNewAuditItem.project_name = this.state.selectedProject.name;
      clonedNewAuditItem.total_score = auditScores.totalScore || 0;
      clonedNewAuditItem.total_max_score = auditScores.totalMaxScore || 0;
      clonedNewAuditItem.answers = JSON.stringify(clonedNewAuditItem.answersObj)

      this.setState({
        currentAudit: clonedNewAuditItem
      });

      return;
    }

    console.log('Updating existing Audit entry.', this.state.audits);

    existingAuditItem.answersObj = JSON.parse(existingAuditItem.answers);
    existingAuditItem.answersObj = existingAuditItem.answersObj.map((group: Group) => {
      group.questions = group.questions.map((question) => {
        if (question.id === questionInfo.id) {
          question = {
            ...questionInfo
          }
        }

        return question;
      })

      return group;
    });

    const answersObj = existingAuditItem.answersObj;
    this.calculateTotalAnswered(answersObj);

    existingAuditItem.answers = JSON.stringify(answersObj);
    const auditScores = this.calculateAuditScores(answersObj);

    existingAuditItem.total_score = auditScores.totalScore || 0;
    existingAuditItem.total_max_score = auditScores.totalMaxScore || 0;

    this.updateAudit(existingAuditItem.Id, existingAuditItem);
  }

  private async createNewAudit(auditItem: AuditItem) {
    try {
      delete auditItem.answersObj;

      const response = await this.state.sp.web.lists.getByTitle("Site Audit").items.add({
        ...auditItem
      });

      const newAuditId = response.data.Id;

      const stateAudits = this.state.audits
      stateAudits.push({
        ...auditItem,
        Id: newAuditId
      });

      const currentAudit = this.state.currentAudit;
      const userAudit = stateAudits.find((audit: any) => audit.audit_id === currentAudit.audit_id);
      if (userAudit) {
        const answersObj = JSON.parse(userAudit.answers);
        currentAudit.answersObj = answersObj;
        currentAudit.score_percentage = `${(userAudit.total_score / (userAudit.total_max_score * 0.01)).toFixed(2)}%`
      }

      this.setState({
        currentAudit: { ...currentAudit, Id: newAuditId },
        audits: stateAudits
      });

      return newAuditId;
    } catch (error) {
      console.error(error)
    }
  }

  private async updateAudit(auditId: number, audit: AuditItem) {
    try {
      const stateAudits = this.state.audits
      stateAudits.map((auditItem: AuditItem) => {
        if (auditItem.audit_id === audit.audit_id) {
          auditItem = { ...audit };
        }

        return auditItem
      });

      const currentAudit = { ...this.state.currentAudit };
      const userAudit = stateAudits.find((audit: any) => audit.audit_id === currentAudit.audit_id);
      if (userAudit) {
        const answersObj = JSON.parse(userAudit.answers || []);
        currentAudit.answersObj = answersObj;
        //i want to save the action items in the database in the action items column


        const auditScores = this.calculateAuditScores(answersObj);

        currentAudit.total_score = auditScores.totalScore || 0;
        currentAudit.total_max_score = auditScores.totalMaxScore || 0;
        currentAudit.score_percentage = `${(userAudit.total_score / (userAudit.total_max_score * 0.01)).toFixed(2)}%`
      }

      this.setState({
        currentAudit,
        audits: stateAudits
      });
    } catch (error) {
      console.error(error)
    }
  }

  private calculateAuditScores(answers: Array<Group>) {
    let totalScore = 0;
    let totalMaxScore = 0;

    answers.forEach((group) => {
      group.questions.forEach((question) => {
        if (question.selectedScoreType !== 'na') {
          totalScore += (question.score || 0);
          totalMaxScore += (question.maxScore || 0)
        }
      })
    })

    return {
      totalScore,
      totalMaxScore
    }
  }

  private calculateTotalAnswered(answers: Array<Group>) {
    answers.forEach((group) => {
      let totalAnswered = 0;
      group.questions.forEach((question) => {
        if (question.selectedScoreType) {
          totalAnswered++
        }
      })

      group.totalAnswered = totalAnswered;
    })
  }

  //create the function for the save button, when it is clicked update the column archive to true
  // private async saveAudit() {
  //   const currentAudit = this.state.currentAudit;
  //   const userAudit = this.state.audits.find((audit: any) => audit.audit_id === currentAudit.audit_id);
  //   if (userAudit) {
  //     const answersObj = JSON.parse(userAudit.answers);
  //     currentAudit.answersObj = answersObj;
  //     currentAudit.score_percentage = `${(userAudit.total_score / (userAudit.total_max_score * 0.01)).toFixed(2)}%`
  //   }

  //   this.setState({
  //     currentAudit
  //   });

  //   const auditItem = {
  //     ...this.state.currentAudit,
  //     archive: true
  //   }

  //   await this.updateAudit(this.state.currentAudit.Id, auditItem);
  // }



  public render(): React.ReactElement<ISheqAuditProps> {
    const saveCompleteButton = "border-solid border-2 border-gray-600 inline-flex items-center rounded border border-transparent mt-3 px-4 py-2 text-black font-bold shadow-md";
    const masterAudit = this.state.currentAudit;

    return (
      <React.Fragment>


        <div>
          <div className="static md:flex md:items-center md:justify-between rounded-lg bg-gray-300 pl-3 pr-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900  sm:truncate sm:text-3xl sm:tracking-tight">
                SHEQ Audit
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => this.saveScoreToDatabase(this.state.currentAudit.Id)}
                className={`${saveCompleteButton} bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer`}
              >
                Save
              </button>
              {/* <button
                type="button"
                onClick={this.saveAudit}
                className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Exit
              </button> */}
            </div>
          </div>


          <SpfxProjects
            key={Math.random()}
            selectedProject={this.state.selectedProject}
            projects={this.state.projects}
            onProjectChange={this.onProjectChange} />



          <div className='flex items-center justify-center'>

            <div className="overflow-visible rounded-lg bg-white px-4 py-5 shadow sm:p-6 text-center">
              <dt className=" text-sm items-center font-medium text-black-400">Overall Score:</dt>
              <dt className="mt-1 text-2xl font-semibold text-gray-900">{masterAudit ? masterAudit.score_percentage : 0} </dt>
            </div>

            <div className="overflow-visible rounded-lg bg-white px-4 ml-3 py-5 shadow sm:p-6 text-center">
              <dt className=" text-sm items-center font-medium text-black-400">Total Score:</dt>
              <dt className="mt-1 text-2xl font-semibold text-gray-900">{masterAudit ? masterAudit.total_score : 0} / {masterAudit ? masterAudit.total_max_score : 0} </dt>
            </div>



          </div>

          <div className='mt-4 mb-3 mx-3'>
            <label htmlFor='email' className='block text-lg mb-3 font-medium text-gray-900'>
              Summary
            </label>
            <div className='mt-1'>
              <input
                type='text'
                name='summary'
                id='summary'
                value={this.state.currentAudit?.summary || ''}
                onChange={(e) => this.handleSummaryChange(e.target.value)}
                placeholder='Enter summary here...'
                className='block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
              />
            </div>
          </div>
          {
            masterAudit && masterAudit.answersObj ? masterAudit.answersObj.map((group: Group, index: number) => {
              return (
                <AuditGroup
                  key={index}
                  title={group.title}
                  totalAnswered={group.totalAnswered}
                  questions={group.questions}
                  sp={this.state.sp}
                  subcontractors={this.state.subcontractors || []}
                  updateScore={(questionInfo: Question) => this.updateScore(masterAudit.audit_id, questionInfo)}
                  updateActionData={(questionInfo: Question) => this.updateQuestionDetails(masterAudit.audit_id, questionInfo)}
                  updateNotes={(questionInfo: Question) => this.updateQuestionDetails(masterAudit.audit_id, questionInfo)} />
              )
            }) : null
          }
          <div className='flex justify-center'>
            {
              (this.state.allQuestionsAnswered) ?
                (
                  <button
                    className={`${saveCompleteButton} bg-green-600 hover:bg-green-700 text-white font-bold shadow-md cursor-pointer`}
                    onClick={() => this.completedScore()}>Mark as Complete
                  </button>
                ) :
                (
                  <button
                    className={`${saveCompleteButton} bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer`}
                    onClick={() => this.saveScoreToDatabase(this.state.currentAudit.Id)}>Save
                  </button>
                )
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}

{/* <p>Total Score: {totalScore}</p> */
}