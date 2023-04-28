import * as React from 'react';
import '../../../../assets/dist/tailwind.css';
import styles from './SheqAudit.module.scss';
import { IProjectProps } from './ISheqAuditProps';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default class Projects extends React.Component<IProjectProps, {}> {
  state: { projects?: Array<any>, selectedProject?: { name: string, id: string } } = {
  }

  constructor(props: IProjectProps) {
    super(props);

    const projects = this.props.projects ? this.props.projects.map((project) => {
      return {
        name: project.ProjectName,
        id: project.Id
      }
    }) : [];

    this.state = {
      projects,
      selectedProject: this.props.selectedProject
    }
  }

  componentDidUpdate(prevProps: Readonly<IProjectProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if (prevProps && prevProps.key && prevProps.key !== this.props.key) {
      const projects = this.props.projects ? this.props.projects.map((project) => {
        return {
          name: project.ProjectName,
          id: project.Id
        }
      }) : [];

      this.setState({
        projects,
        selectedProject: this.props.selectedProject
      });
    }
  }

  classNames = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ')
  }

  setSelectedProject = (value: { name: string, id: string }) => {
    this.setState({
      selectedProject: { ...value }
    })

    this.props.onProjectChange(value);
  }

  public render(): React.ReactElement<IProjectProps> {
    return (
      <div className={`${styles['project-selector-container']}`}>
        <Listbox value={this.state.selectedProject} onChange={(value) => this.setSelectedProject(value)}>
          <Listbox.Label className=" block text-2xl font-medium text-black-900">Select Project</Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm">
              <span className="block truncate">{this.state.selectedProject?.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {this.state.projects?.map((project, projectIndex) => (
                  <Listbox.Option
                    key={projectIndex}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-3 pr-9' ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                      }`
                    }
                    value={project}
                  >

                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {project.name}
                        </span>

                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        {/* <div className='flex items-center justify-center mt-32'>
          <button className={`${styles['action-button']} mx-8 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border-0`}>Start</button>
          <button className={`${styles['action-button']} mx-8 cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-0`}>Cancel</button>
        </div> */}
      </div>
    )
  }
}